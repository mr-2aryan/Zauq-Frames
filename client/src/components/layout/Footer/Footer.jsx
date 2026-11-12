import { Link } from 'react-router';
import { FacebookIcon, InstagramIcon, MailIcon } from '@/components/icons';
import { Container, Logo } from '@/components/ui';
import { FOOTER_NAV, LEGAL_LINKS } from '@/config/navigation';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { NewsletterForm } from './NewsletterForm.jsx';
import styles from './Footer.module.css';

const SOCIALS = [
  { label: 'Instagram', href: SITE.instagram.href, Icon: InstagramIcon },
  { label: 'Facebook', href: SITE.facebookUrl, Icon: FacebookIcon },
  { label: 'Email', href: `mailto:${SITE.email}`, Icon: MailIcon },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.columns}>
        <div className={styles.brand}>
          <Link to={ROUTES.home} aria-label={`${SITE.fullName} — home`} className={styles.logoLink}>
            <Logo tone="light" size={24} />
          </Link>
          <p className={styles.blurb}>{SITE.description}</p>
          <NewsletterForm />
          <div className={styles.socials}>
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={styles.social}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <Icon size={19} />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_NAV.map((group) => (
          <nav key={group.title} aria-label={group.title} className={styles.column}>
            <span className={styles.heading}>{group.title}</span>
            {group.links.map((link) => (
              <Link key={link.label} to={link.to} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}

        <div className={styles.column}>
          <span className={styles.heading}>Contact</span>
          <a href={`mailto:${SITE.email}`} className={styles.link}>
            {SITE.email}
          </a>
          <a href={SITE.phone.href} className={styles.link}>
            {SITE.phone.display}
          </a>
          <span>{SITE.address}</span>
          <span>{SITE.hours}</span>
        </div>
      </Container>

      <Container className={styles.bottom}>
        <span>
          © {SITE.foundedYear} {SITE.name}. All rights reserved.
        </span>
        <nav aria-label="Legal" className={styles.legal}>
          {LEGAL_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={styles.legalLink}>
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
