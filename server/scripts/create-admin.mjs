/**
 * Creates an admin account for admin.zauqframes.com (or makes an existing
 * customer account an admin), asking for the details in the terminal. The
 * password is typed hidden and is only ever stored as a hash.
 *
 *     npm run create-admin -w server
 */
import readline from 'node:readline';
import { pool } from '../src/db/pool.js';
import { closeDb, initDatabase } from '../src/db/index.js';
import { adminPasswordProblem } from '../src/modules/admin/admin.auth.js';
import { hashPassword } from '../src/modules/auth/passwords.js';
import { deleteUserSessions } from '../src/modules/auth/sessions.js';
import { usersRepository } from '../src/modules/auth/users.repository.js';

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Print the question, but nothing of what is typed.
      rl._writeToOutput = (text) => {
        if (text.includes(question)) rl.output.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

if (!pool) {
  console.error('DATABASE_URL is not set: an admin made now would vanish on restart. Run this on the server, in /var/www/zauq-frames.');
  process.exit(1);
}

try {
  await initDatabase();
  console.log('\nCreate an admin for the Zauq Frames admin panel.\n');
  let name;
  for (;;) {
    name = await ask('Your name: ');
    if (name.length >= 2) break;
    console.log('  Please enter your name (at least 2 letters).');
  }
  let email;
  for (;;) {
    email = (await ask('Email (e.g. admin@zauqframes.com): ')).toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) break;
    console.log('  That isn’t an email address. It needs an @, like admin@zauqframes.com.');
  }

  let password;
  for (;;) {
    password = await ask('Password (12+ characters, hidden as you type): ', { hidden: true });
    const problem = adminPasswordProblem(password, email);
    if (problem) {
      console.log(`  ${problem}`);
      continue;
    }
    if ((await ask('Type it again: ', { hidden: true })) !== password) {
      console.log('  Those didn’t match. Try again.');
      continue;
    }
    break;
  }

  const passwordHash = await hashPassword(password);
  const existing = await usersRepository.findOneBy('email', email);
  if (existing) {
    await usersRepository.update(existing.id, { name, role: 'admin', passwordHash, adminSince: existing.role === 'admin' ? existing.adminSince : new Date().toISOString() });
    await deleteUserSessions(existing.id);
    console.log(`\nDone: ${email} is now an admin (its password was changed).`);
  } else {
    await usersRepository.create({ name, email, phone: '', address: '', city: '', role: 'admin', passwordHash, adminSince: new Date().toISOString() });
    console.log(`\nDone: admin ${email} created.`);
  }
  console.log('Sign in at the admin panel with this email and password.\n');
} catch (error) {
  console.error(`\nNot done: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeDb();
}
