import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Link as MuiLink,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { EmptyState, Loader, PageHeader } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { ago, dateTime, whatsapp } from '../lib/format.js';
import { useData, useUi } from '../lib/hooks.jsx';

/** The same wording the shop's contact form shows. */
const TOPICS = {
  order: 'An order',
  custom: 'Custom frame',
  sizes: 'Sizes & prices',
  business: 'Business / bulk',
  other: 'Something else',
};

const STATUS = {
  new: { label: 'New', color: 'secondary', variant: 'filled' },
  read: { label: 'Read', color: 'default', variant: 'outlined' },
  replied: { label: 'Replied', color: 'success', variant: 'outlined' },
  archived: { label: 'Archived', color: 'default', variant: 'outlined' },
};

const TABS = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'new', label: 'New' },
  { key: 'read', label: 'Read' },
  { key: 'replied', label: 'Replied' },
  { key: 'archived', label: 'Archived' },
  { key: 'all', label: 'All' },
];

function countFor(counts, key) {
  if (!counts) return undefined;
  const { new: fresh = 0, read = 0, replied = 0, archived = 0 } = counts;
  if (key === 'inbox') return fresh + read + replied;
  if (key === 'all') return fresh + read + replied + archived;
  return counts[key] ?? 0;
}

function TabLabel({ label, count }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <span>{label}</span>
      {count != null && <Chip size="small" label={count} sx={{ height: 20, fontSize: 12 }} />}
    </Stack>
  );
}

const firstName = (name) => String(name ?? '').trim().split(/\s+/)[0] || 'there';

function Contact({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography component="div" variant="body2" sx={{ wordBreak: 'break-word', fontWeight: 600 }}>
        {children || '—'}
      </Typography>
    </Box>
  );
}

function MessageItem({ message, expanded, busy, onToggle, onStatus, onReplied, onDelete }) {
  const status = STATUS[message.status] ?? { label: message.status, color: 'default', variant: 'outlined' };
  const isNew = message.status === 'new';
  const replyText = `Hi ${firstName(message.name)}, this is Zauq Frames about your message: `;
  const mailto = message.email
    ? `mailto:${message.email}?subject=${encodeURIComponent('Your message to Zauq Frames')}&body=${encodeURIComponent(`Hi ${firstName(message.name)},\n\n`)}`
    : null;

  return (
    <Accordion
      expanded={expanded}
      onChange={(_e, open) => onToggle(message, open)}
      disableGutters
      elevation={0}
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        border: '1px solid',
        borderColor: isNew ? 'secondary.main' : 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        '&::before': { display: 'none' },
        '&:first-of-type, &:last-of-type': { borderRadius: 3 },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: { xs: 1.5, sm: 2.5 }, '& .MuiAccordionSummary-content': { minWidth: 0, my: 1.5 } }}>
        <Stack spacing={0.5} sx={{ minWidth: 0, width: '100%' }}>
          <Stack useFlexGap direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
            <Typography sx={{ fontWeight: isNew ? 800 : 700 }}>{message.name}</Typography>
            <Chip size="small" label={TOPICS[message.topic] ?? message.topic} variant="outlined" />
            <Chip size="small" label={status.label} color={status.color} variant={status.variant} />
            <Tooltip title={dateTime(message.createdAt)}>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
                {ago(message.createdAt)}
              </Typography>
            </Tooltip>
          </Stack>
          {!expanded && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {message.message}
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 1.5, sm: 2.5 }, pb: 2.5, pt: 0 }}>
        <Stack spacing={2}>
          <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', bgcolor: 'rgba(255,255,255,.6)', border: '1px solid rgba(38,44,20,.08)', borderRadius: 2, p: 2 }}>{message.message}</Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
            <Contact label="Phone">
              {message.phone ? (
                <MuiLink href={`tel:${String(message.phone).replace(/[^\d+]/g, '')}`} underline="hover">
                  {message.phone}
                </MuiLink>
              ) : null}
            </Contact>
            <Contact label="Email">
              {message.email ? (
                <MuiLink href={mailto} underline="hover">
                  {message.email}
                </MuiLink>
              ) : null}
            </Contact>
            <Contact label="Order">
              {message.orderId ? (
                <MuiLink component={RouterLink} to={`/orders/${encodeURIComponent(message.orderId)}`} underline="hover">
                  {message.orderId}
                </MuiLink>
              ) : null}
            </Contact>
            <Contact label="Sent">{dateTime(message.createdAt)}</Contact>
          </Box>

          <Stack useFlexGap direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {message.phone && (
              <Button
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon />}
                component="a"
                href={whatsapp(message.phone, replyText)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onReplied(message)}
                disabled={busy}
              >
                Reply on WhatsApp
              </Button>
            )}
            {mailto && (
              <Button variant="outlined" startIcon={<EmailOutlinedIcon />} component="a" href={mailto} disabled={busy}>
                Email
              </Button>
            )}
            {message.status === 'new' && (
              <Button startIcon={<MarkEmailReadIcon />} onClick={() => onStatus(message, 'read')} disabled={busy}>
                Mark read
              </Button>
            )}
            {message.status !== 'replied' && (
              <Button startIcon={<DoneAllIcon />} onClick={() => onStatus(message, 'replied')} disabled={busy}>
                Mark replied
              </Button>
            )}
            {message.status === 'archived' ? (
              <Button startIcon={<UnarchiveIcon />} onClick={() => onStatus(message, 'read')} disabled={busy}>
                Back to inbox
              </Button>
            ) : (
              <Button startIcon={<ArchiveIcon />} onClick={() => onStatus(message, 'archived')} disabled={busy}>
                Archive
              </Button>
            )}
            <Button color="error" startIcon={<DeleteOutlinedIcon />} onClick={() => onDelete(message)} disabled={busy}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

const DONE = { read: 'Marked as read.', replied: 'Marked as replied.', archived: 'Message archived.' };

export default function MessagesPage() {
  const { notify, confirm } = useUi();
  const [tab, setTab] = useState('inbox');
  const query = useData(`/messages?status=${tab}`);
  const [open, setOpen] = useState(() => new Set());
  const [busyId, setBusyId] = useState(null);

  /** Changes a message's status here without reloading (so it doesn't vanish while it's being read). */
  const patchLocally = (id, status) =>
    query.setData((data) => {
      if (!data) return data;
      const before = data.items.find((m) => m.id === id)?.status;
      const counts = { ...data.counts };
      if (before && before !== status) {
        counts[before] = Math.max(0, (counts[before] ?? 0) - 1);
        counts[status] = (counts[status] ?? 0) + 1;
      }
      return { ...data, counts, items: data.items.map((m) => (m.id === id ? { ...m, status } : m)) };
    });

  const toggle = (message, isOpen) => {
    setOpen((current) => {
      const next = new Set(current);
      if (isOpen) next.add(message.id);
      else next.delete(message.id);
      return next;
    });
    if (isOpen && message.status === 'new') {
      patchLocally(message.id, 'read');
      api(`/messages/${encodeURIComponent(message.id)}`, { method: 'PATCH', body: { status: 'read' } }).catch((error) => {
        patchLocally(message.id, 'new');
        notify(error.message, 'error');
      });
    }
  };

  const setStatus = async (message, status) => {
    setBusyId(message.id);
    try {
      await api(`/messages/${encodeURIComponent(message.id)}`, { method: 'PATCH', body: { status } });
      notify(status === 'read' && message.status === 'archived' ? 'Moved back to the inbox.' : DONE[status]);
      query.reload();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  // The WhatsApp chat opens in a new tab (the button is a link); the message is then marked as replied.
  const replied = async (message) => {
    if (message.status === 'replied') return;
    try {
      await api(`/messages/${encodeURIComponent(message.id)}`, { method: 'PATCH', body: { status: 'replied' } });
      patchLocally(message.id, 'replied');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const remove = async (message) => {
    const ok = await confirm({
      title: 'Delete this message?',
      text: `The message from ${message.name} will be removed for good. To keep it but clear it from the inbox, archive it instead.`,
      danger: true,
      confirmLabel: 'Delete message',
    });
    if (!ok) return;
    setBusyId(message.id);
    try {
      await api(`/messages/${encodeURIComponent(message.id)}`, { method: 'DELETE' });
      notify('Message deleted.');
      query.reload();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const counts = query.data?.counts;

  return (
    <>
      <PageHeader title="Messages" subtitle="Messages sent from the contact form in the shop. Open one to read it and reply on WhatsApp or by email." />

      <Card sx={{ mb: 2 }}>
        <Box sx={{ px: { xs: 1, sm: 2 } }}>
          <Tabs
            value={tab}
            onChange={(_e, value) => {
              setTab(value);
              setOpen(new Set());
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {TABS.map((t) => (
              <Tab key={t.key} value={t.key} label={<TabLabel label={t.label} count={countFor(counts, t.key)} />} />
            ))}
          </Tabs>
        </Box>
        {query.loading && query.data ? <LinearProgress sx={{ height: 2 }} /> : <Box sx={{ height: 2 }} />}
      </Card>

      <Loader query={query} label="Loading messages…">
        {({ items }) =>
          items.length === 0 ? (
            <Card>
              <EmptyState
                title={tab === 'inbox' || tab === 'new' ? 'No messages waiting' : 'Nothing here'}
                text={tab === 'inbox' || tab === 'new' ? 'When someone writes to you from the contact page, their message will appear here.' : undefined}
              />
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {items.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  expanded={open.has(message.id)}
                  busy={busyId === message.id}
                  onToggle={toggle}
                  onStatus={setStatus}
                  onReplied={replied}
                  onDelete={remove}
                />
              ))}
            </Stack>
          )
        }
      </Loader>
    </>
  );
}
