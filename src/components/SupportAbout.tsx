import { useState } from 'react'
import {
  X, ChevronRight, ChevronDown, Shield, FileText,
  User, Lock, AlertTriangle, Ticket, Bell, LifeBuoy,
  MessageSquare, KeyRound, ArrowLeft, Store, Phone, Mail, Flag, MapPin, CheckCircle
} from 'lucide-react'

interface Props {
  onClose: () => void
  light?: boolean
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen =
  | 'main'
  | 'help_center'
  | 'account_center'
  | 'privacy_safety'
  | 'terms'

type FAQItem = { q: string; a: string }

// ── Data ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How do I reset my password?',
    a: 'Go to Account Center → Account Recovery and follow the steps to reset your password via your registered email or phone number.',
  },
  {
    q: 'How do I report a problem with my order?',
    a: 'Open a Support Ticket from Help Center → Support Tickets. Provide your order ID and a description of the issue. Our team responds within 24 hours.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. All payment data is encrypted using industry-standard TLS. We never store full card numbers on our servers.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Visit Account Center → Privacy & Account Settings and select "Delete Account". This action is permanent and cannot be undone.',
  },
  {
    q: 'How do I track my delivery?',
    a: 'After placing an order, go to Activity → History. Tap your order to see real-time delivery status and estimated arrival.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept Cash, GCash, Maya, and major credit/debit cards (Visa, Mastercard, JCB).',
  },
]

// ── Reusable row ──────────────────────────────────────────────────────────────
function MenuRow({
  icon: Icon, iconBg, iconColor, label, sub, onClick, light,
}: {
  icon: any; iconBg: string; iconColor: string; label: string; sub?: string
  onClick: () => void; light?: boolean
}) {
  const row  = light ? 'hover:bg-gray-50 border-gray-100' : 'hover:bg-slate-700/20 border-white/5'
  const text = light ? 'text-gray-900' : 'text-white'
  const mute = light ? 'text-gray-400' : 'text-slate-500'
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-0 ${row} transition-colors`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={17} className={iconColor} strokeWidth={2} />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-semibold ${text}`}>{label}</p>
        {sub && <p className={`text-xs ${mute} mt-0.5`}>{sub}</p>}
      </div>
      <ChevronRight size={15} className={mute} strokeWidth={2} />
    </button>
  )
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
function FAQAccordion({ items, light }: { items: FAQItem[]; light?: boolean }) {
  const [open, setOpen] = useState<number | null>(null)
  const bg   = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const text = light ? 'text-gray-900' : 'text-white'
  const mute = light ? 'text-gray-400' : 'text-slate-400'
  const sep  = light ? 'border-gray-100' : 'border-white/5'
  const ans  = light ? 'bg-gray-50' : 'bg-slate-900/40'
  return (
    <div className={`${bg} rounded-2xl overflow-hidden`}>
      {items.map((item, i) => (
        <div key={i} className={`border-b ${sep} last:border-0`}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
              light ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20'
            }`}
          >
            <p className={`text-sm font-medium ${text} pr-4`}>{item.q}</p>
            <ChevronDown
              size={15}
              className={`${mute} shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
          {open === i && (
            <div className={`px-4 py-3 ${ans}`}>
              <p className={`text-xs ${mute} leading-relaxed`}>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Simple info section card ──────────────────────────────────────────────────
function InfoCard({ title, children, light }: { title?: string; children: React.ReactNode; light?: boolean }) {
  const bg   = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const text = light ? 'text-gray-900' : 'text-white'
  const mute = light ? 'text-gray-500' : 'text-slate-400'
  return (
    <div className={`${bg} rounded-2xl p-4 space-y-2`}>
      {title && <p className={`text-sm font-semibold ${text}`}>{title}</p>}
      <div className={`text-xs ${mute} leading-relaxed space-y-2`}>{children}</div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SupportAbout({ onClose, light }: Props) {
  const [screen, setScreen] = useState<Screen>('main')

  const bg     = light ? 'bg-gray-50'   : 'bg-[#0d1424]'
  const hdr    = light ? 'border-gray-200 bg-white' : 'border-white/5 bg-[#0d1424]'
  const title  = light ? 'text-gray-900' : 'text-white'
  const sub    = light ? 'text-gray-400' : 'text-slate-500'
  const card   = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const secLbl = light ? 'text-gray-400' : 'text-slate-500'
  const goBack = () => setScreen('main')

  // ── Header ──────────────────────────────────────────────────────────────
  const screenTitles: Record<Screen, string> = {
    main:           'Support & About',
    help_center:    'Help Center',
    account_center: 'Account Center',
    privacy_safety: 'Privacy & User Safety',
    terms:          'Terms & Conditions',
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className={`absolute inset-0 ${light ? 'bg-black/20' : 'bg-black/60'} backdrop-blur-sm`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`animate-slide-right relative ${bg} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b ${hdr} shrink-0`}>
          {screen !== 'main' && (
            <button
              onClick={goBack}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
            </button>
          )}
          <div className="flex-1">
            <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
              {screenTitles[screen]}
            </h2>
            {screen === 'main' && (
              <p className={`text-xs ${sub}`}>Evaristo's Sari-Sari Store · v1.0.0</p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

          {/* ── MAIN SCREEN ─────────────────────────────────────────────── */}
          {screen === 'main' && (
            <>
              {/* Store identity card */}
              <div className={`${card} rounded-2xl p-4 flex items-center gap-4`}>
                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                  <Store size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
                    Evaristo's
                  </p>
                  <p className={`text-xs ${sub}`}>Sari-Sari Store · Est. 1993</p>
                  <div className="flex items-center gap-1 text-xs">
                    <Flag size={12} className="text-red-500" strokeWidth={2} />
                    <span className={sub}>Proudly Pinoy · Family Owned</span>
                  </div>
                </div>
              </div>

              {/* Support section */}
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${secLbl} mb-2 px-1`}>Support</p>
                <div className={`${card} rounded-2xl overflow-hidden`}>
                  <MenuRow
                    icon={LifeBuoy} iconBg={light ? 'bg-blue-50' : 'bg-blue-500/10'} iconColor="text-blue-500"
                    label="Help Center" sub="FAQs, tickets, account recovery"
                    onClick={() => setScreen('help_center')} light={light}
                  />
                  <MenuRow
                    icon={User} iconBg={light ? 'bg-purple-50' : 'bg-purple-500/10'} iconColor="text-purple-500"
                    label="Account Center" sub="Profile, recovery, security alerts"
                    onClick={() => setScreen('account_center')} light={light}
                  />
                </div>
              </div>

              {/* Legal section */}
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${secLbl} mb-2 px-1`}>Legal</p>
                <div className={`${card} rounded-2xl overflow-hidden`}>
                  <MenuRow
                    icon={Shield} iconBg={light ? 'bg-green-50' : 'bg-green-500/10'} iconColor="text-green-500"
                    label="Privacy & User Safety" sub="Data policy, safety center"
                    onClick={() => setScreen('privacy_safety')} light={light}
                  />
                  <MenuRow
                    icon={FileText} iconBg={light ? 'bg-amber-50' : 'bg-amber-500/10'} iconColor="text-amber-500"
                    label="Terms & Conditions" sub="Usage rules and policies"
                    onClick={() => setScreen('terms')} light={light}
                  />
                </div>
              </div>

              {/* About */}
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${secLbl} mb-2 px-1`}>About</p>
                <div className={`${card} rounded-2xl overflow-hidden`}>
                  <div className="px-4 py-3 space-y-1.5">
                    {[
                      ['App Version',   'v1.0.0'],
                      ['Build',         '2024.06'],
                      ['Platform',      'Web / PWA'],
                      ['Contact',       '0912-345-6789'],
                      ['Email',         'support@evaristo.ph'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className={`text-xs ${sub}`}>{k}</span>
                        <span className={`text-xs font-medium ${title}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className={`text-center text-[10px] ${sub} pb-2`}>
                © 2024 Tindahan ni Evaristo. All rights reserved.
              </p>
            </>
          )}

          {/* ── HELP CENTER ─────────────────────────────────────────────── */}
          {screen === 'help_center' && (
            <>
              <div className={`${card} rounded-2xl overflow-hidden`}>
                <MenuRow
                  icon={KeyRound} iconBg={light ? 'bg-blue-50' : 'bg-blue-500/10'} iconColor="text-blue-500"
                  label="Account Recovery" sub="Reset password, recover access"
                  onClick={() => {}} light={light}
                />
                <MenuRow
                  icon={Shield} iconBg={light ? 'bg-green-50' : 'bg-green-500/10'} iconColor="text-green-500"
                  label="Safety Center" sub="Report abuse, block users"
                  onClick={() => {}} light={light}
                />
                <MenuRow
                  icon={Ticket} iconBg={light ? 'bg-purple-50' : 'bg-purple-500/10'} iconColor="text-purple-500"
                  label="Support Tickets" sub="Submit or track a support request"
                  onClick={() => {}} light={light}
                />
                <MenuRow
                  icon={Bell} iconBg={light ? 'bg-red-50' : 'bg-red-500/10'} iconColor="text-red-500"
                  label="Security Alerts" sub="Suspicious login and activity alerts"
                  onClick={() => {}} light={light}
                />
              </div>

              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${secLbl} mb-2 px-1`}>
                  Frequently Asked Questions
                </p>
                <FAQAccordion items={FAQ_ITEMS} light={light} />
              </div>

              <InfoCard title="Need more help?" light={light}>
                <p>Can't find what you're looking for? Open a Support Ticket and our team will get back to you within 24 hours.</p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-blue-500" strokeWidth={2} />
                  <strong>0912-345-6789</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-amber-500" strokeWidth={2} />
                  <strong>support@evaristo.ph</strong>
                </p>
              </InfoCard>
            </>
          )}

          {/* ── ACCOUNT CENTER ──────────────────────────────────────────── */}
          {screen === 'account_center' && (
            <>
              <div className={`${card} rounded-2xl overflow-hidden`}>
                <MenuRow
                  icon={KeyRound} iconBg={light ? 'bg-blue-50' : 'bg-blue-500/10'} iconColor="text-blue-500"
                  label="Account Recovery" sub="Reset password or recover your account"
                  onClick={() => {}} light={light}
                />
                <MenuRow
                  icon={Lock} iconBg={light ? 'bg-amber-50' : 'bg-amber-500/10'} iconColor="text-amber-500"
                  label="Privacy & Account Settings" sub="Manage your personal data"
                  onClick={() => {}} light={light}
                />
                <MenuRow
                  icon={Bell} iconBg={light ? 'bg-red-50' : 'bg-red-500/10'} iconColor="text-red-500"
                  label="Security Alerts" sub="Review recent login activity"
                  onClick={() => {}} light={light}
                />
                <MenuRow
                  icon={MessageSquare} iconBg={light ? 'bg-purple-50' : 'bg-purple-500/10'} iconColor="text-purple-500"
                  label="Contact Support" sub="Get help from our team"
                  onClick={() => {}} light={light}
                />
              </div>

              <InfoCard title="Account Recovery" light={light}>
                <p>If you've lost access to your account, contact us directly:</p>
                <p className="flex items-center gap-2"><Phone size={14} className="text-blue-500" strokeWidth={2} /><strong>0912-345-6789</strong> — available 6AM–10PM daily</p>
                <p className="flex items-center gap-2"><Mail size={14} className="text-amber-500" strokeWidth={2} /><strong>support@evaristo.ph</strong> — reply within 24 hrs</p>
                <p>Please have your registered name and order history ready to verify identity.</p>
              </InfoCard>

              <InfoCard title="Security Alerts" light={light}>
                <p>We will never ask for your password via SMS or chat. If you receive a suspicious message claiming to be from Evaristo's, do not click any links and report it immediately.</p>
              </InfoCard>
            </>
          )}

          {/* ── PRIVACY & SAFETY ────────────────────────────────────────── */}
          {screen === 'privacy_safety' && (
            <>
              <InfoCard title="Privacy Policy" light={light}>
                <p>Evaristo's Sari-Sari Store collects only the information necessary to process your orders and improve your shopping experience.</p>
                <p><strong>What we collect:</strong> Name, contact number, delivery address, and order history.</p>
                <p><strong>What we do NOT collect:</strong> Full payment card numbers, government IDs, or unnecessary personal data.</p>
                <p>Your data is stored securely and never sold to third parties.</p>
              </InfoCard>

              <InfoCard title="Safety Center" light={light}>
                <p>We are committed to maintaining a safe shopping environment. If you experience any of the following, please contact us immediately:</p>
                <ul className="space-y-1 mt-1">
                  {[
                    'Unauthorized access to your account',
                    'Suspicious messages or phishing attempts',
                    'Fraudulent orders placed in your name',
                    'Harassment or misconduct by any staff',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <AlertTriangle size={14} className="mt-0.5 text-red-500" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>

              <InfoCard title="User Safety Guidelines" light={light}>
                <p>To keep your account safe:</p>
                <ul className="space-y-1 mt-1">
                  {[
                    'Use a strong, unique password',
                    'Never share your login credentials',
                    'Log out on shared devices',
                    'Enable security alerts in Account Center',
                    'Verify delivery personnel before handing over payment',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle size={14} className="mt-0.5 text-emerald-500" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>

              <InfoCard title="Data Deletion" light={light}>
                <p>You may request deletion of your personal data at any time by contacting support. We will process your request within 7 business days.</p>
              </InfoCard>
            </>
          )}

          {/* ── TERMS & CONDITIONS ──────────────────────────────────────── */}
          {screen === 'terms' && (
            <>
              <InfoCard title="1. Acceptance of Terms" light={light}>
                <p>By using Evaristo's Sari-Sari Store application, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the app.</p>
              </InfoCard>

              <InfoCard title="2. Use of Service" light={light}>
                <p>This app is intended for personal, non-commercial use only. You agree not to:</p>
                <ul className="space-y-1 mt-1">
                  {[
                    '• Misuse or attempt to hack the application',
                    '• Place fraudulent or false orders',
                    '• Impersonate store staff or other users',
                    '• Use the app for any unlawful purpose',
                  ].map(i => <li key={i}>{i}</li>)}
                </ul>
              </InfoCard>

              <InfoCard title="3. Orders & Payments" light={light}>
                <p>All orders are subject to product availability. We reserve the right to cancel any order due to stock constraints or suspected fraud. Payments made via GCash or Maya are non-refundable unless the order was cancelled by the store.</p>
              </InfoCard>

              <InfoCard title="4. Delivery" light={light}>
                <p>Delivery times are estimates and may vary. Evaristo's is not liable for delays caused by weather, traffic, or other circumstances beyond our control. Free delivery applies to orders of ₱1,000 and above within our service area.</p>
              </InfoCard>

              <InfoCard title="5. Privacy" light={light}>
                <p>Your personal data is handled in accordance with our Privacy Policy. By using this app, you consent to the collection and use of your data as described therein.</p>
              </InfoCard>

              <InfoCard title="6. Intellectual Property" light={light}>
                <p>All content, branding, and design elements of this application are owned by Evaristo's Sari-Sari Store. Unauthorized reproduction or distribution is prohibited.</p>
              </InfoCard>

              <InfoCard title="7. Changes to Terms" light={light}>
                <p>We reserve the right to update these terms at any time. Continued use of the app after changes are posted constitutes your acceptance of the revised terms.</p>
              </InfoCard>

              <InfoCard title="8. Contact" light={light}>
                <p>For any questions regarding these terms, contact us at:</p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-blue-500" strokeWidth={2} />
                  <strong>0912-345-6789</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-amber-500" strokeWidth={2} />
                  <strong>support@evaristo.ph</strong>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-500" strokeWidth={2} />
                  Blk 3 Lot 5, Sampaguita St., Maynila
                </p>
              </InfoCard>

              <p className={`text-center text-[10px] ${sub} pb-2`}>
                Last updated: June 2024
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
