import { HttpError } from '../../utils/HttpError.js';
import { clearFailedLogins, isLockedOut, LOCKED_MESSAGE, noteFailedLogin } from './loginGuard.js';
import { hashPassword, verifyPassword } from './passwords.js';
import { usersRepository } from './users.repository.js';

/** What the browser may see — never the password hash. */
export const toPublicUser = ({ passwordHash: _hash, ...user }) => user;

const WRONG_LOGIN = 'Incorrect email or password.';

export const authService = {
  async register({ name, email, password, phone }) {
    if (await usersRepository.findOne((user) => user.email === email)) {
      throw HttpError.conflict('An account with this email already exists. Sign in instead.');
    }
    const user = await usersRepository.create({ name, email, phone, address: '', city: '', passwordHash: await hashPassword(password) });
    return toPublicUser(user);
  },

  async login({ email, password }, ip) {
    if (isLockedOut(email, ip)) throw HttpError.tooManyRequests(LOCKED_MESSAGE);
    const user = await usersRepository.findOne((entry) => entry.email === email);
    // Hash even when there's no such user, so timing doesn't reveal which emails have accounts.
    const ok = user ? await verifyPassword(password, user.passwordHash) : (await hashPassword(password), false);
    if (!ok) {
      noteFailedLogin(email, ip);
      throw HttpError.unauthorized(WRONG_LOGIN);
    }
    clearFailedLogins(email, ip);
    return toPublicUser(user);
  },

  async findById(id) {
    const user = await usersRepository.findById(id);
    return user ? toPublicUser(user) : null;
  },

  async updateProfile(id, changes) {
    const user = await usersRepository.update(id, changes);
    if (!user) throw HttpError.notFound('We could not find your account.');
    return toPublicUser(user);
  },

  async changePassword(id, { currentPassword, newPassword }, ip) {
    const user = await usersRepository.findById(id);
    if (!user) throw HttpError.notFound('We could not find your account.');
    if (isLockedOut(user.email, ip)) throw HttpError.tooManyRequests(LOCKED_MESSAGE);
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      noteFailedLogin(user.email, ip);
      throw HttpError.badRequest('Please check the highlighted fields.', [{ field: 'currentPassword', message: 'That isn’t your current password.' }]);
    }
    await usersRepository.update(id, { passwordHash: await hashPassword(newPassword) });
  },
};
