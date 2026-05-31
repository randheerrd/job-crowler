import { Link } from 'react-router-dom';
import {
  ArrowRight, Search, RefreshCw, ClipboardList, FileText,
  Zap, Bookmark, Check, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

const MOCK_JOBS = [
  { company: 'Stripe',     role: 'Frontend Engineer',       location: 'Remote',     type: 'Full-time', portal: 'Wellfound',   color: '#8b5cf6' },
  { company: 'Razorpay',   role: 'Product Engineer',        location: 'Bangalore',  type: 'Full-time', portal: 'Naukri',      color: '#f59e0b' },
  { company: 'Atlassian',  role: 'Software Engineer II',    location: 'Remote',     type: 'Full-time', portal: 'LinkedIn',    color: '#3b82f6' },
  { company: 'CRED',       role: 'Backend Developer',       location: 'Bangalore',  type: 'Hybrid',    portal: 'Naukri',      color: '#10b981' },
  { company: 'Notion',     role: 'Full-Stack Engineer',     location: 'Remote',     type: 'Full-time', portal: 'Remotive',    color: '#06b6d4' },
];

const PORTAL_BADGE: Record<string, string> = {
  LinkedIn:    'bg-blue-500/10 text-blue-400 border-blue-500/15',
  Naukri:      'bg-orange-500/10 text-orange-400 border-orange-500/15',
  Indeed:      'bg-violet-500/10 text-violet-400 border-violet-500/15',
  Wellfound:   'bg-rose-500/10 text-rose-400 border-rose-500/15',
  Internshala: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
  Remotive:    'bg-teal-500/10 text-teal-400 border-teal-500/15',
};

const FEATURES = [
  {
    icon: Search,
    title: 'Multi-portal aggregation',
    desc: 'Pulls live listings from LinkedIn, Naukri, Indeed, Wellfound, Internshala, and Remotive in one click.',
  },
  {
    icon: RefreshCw,
    title: 'Real-time refresh',
    desc: 'Hit refresh and get today\'s listings instantly. No stale data, no delays, no algorithmic filtering.',
  },
  {
    icon: ClipboardList,
    title: 'Application tracker',
    desc: 'Log every application. Track status from Applied → Interview → Offer in table or Kanban view.',
  },
  {
    icon: FileText,
    title: 'Document management',
    desc: 'Upload your resume, write tailored cover letters, and import your LinkedIn profile — all saved in one place.',
  },
  {
    icon: Zap,
    title: 'Smart filtering',
    desc: 'Filter by portal, job type, location, or keyword across all sources at once. Find what matters fast.',
  },
  {
    icon: Bookmark,
    title: 'Save for later',
    desc: 'Bookmark interesting roles and revisit them any time. Never lose track of a good opportunity again.',
  },
];

const PORTALS = [
  { name: 'LinkedIn',    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/15' },
  { name: 'Naukri',      cls: 'bg-orange-500/10 text-orange-400 border-orange-500/15' },
  { name: 'Indeed',      cls: 'bg-violet-500/10 text-violet-400 border-violet-500/15' },
  { name: 'Wellfound',   cls: 'bg-rose-500/10 text-rose-400 border-rose-500/15' },
  { name: 'Internshala', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' },
  { name: 'Remotive',    cls: 'bg-teal-500/10 text-teal-400 border-teal-500/15' },
];

const STEPS = [
  {
    num: '01',
    title: 'Create your account',
    desc: 'Sign up in under a minute. Upload your resume and set preferences in a quick onboarding flow.',
  },
  {
    num: '02',
    title: 'Crawl all portals at once',
    desc: 'Hit "Refresh jobs" and Calos fetches live listings from all 6 portals simultaneously.',
  },
  {
    num: '03',
    title: 'Apply and track everything',
    desc: 'Apply directly to jobs, track every application status, and add notes — all from one dashboard.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ── Sticky navbar ── */}
      <header className="sticky top-0 z-40 border-b border-gray-300" style={{ backgroundColor: 'rgba(15,14,13,0.92)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 60 60" fill="none" className="shrink-0 text-primary-500">
              <defs><clipPath id="nav-clip"><circle cx="28" cy="30" r="24"/></clipPath></defs>
              <circle cx="28" cy="30" r="26" stroke="currentColor" strokeWidth="3.5"/>
              <circle cx="37" cy="30" r="19" stroke="currentColor" strokeWidth="3.5" clipPath="url(#nav-clip)"/>
              <circle cx="46" cy="30" r="11" stroke="currentColor" strokeWidth="3.5" clipPath="url(#nav-clip)"/>
            </svg>
            <span className="text-sm font-semibold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Calos</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-xs text-gray-600 hover:text-gray-800 transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs text-gray-600 hover:text-gray-800 transition-colors">How it works</a>
            <a href="#portals" className="text-xs text-gray-600 hover:text-gray-800 transition-colors">Portals</a>
            <a href="#story" className="text-xs text-gray-600 hover:text-gray-800 transition-colors">Story</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 transition-colors"
            >
              Get started <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs rounded mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
            Free · No ads · Built for job seekers
          </div>

          <h1
            className="text-[42px] font-bold text-gray-900 mb-4 leading-[1.1]"
            style={{ letterSpacing: '-0.035em' }}
          >
            All your job boards.<br />One dashboard.
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed max-w-lg mb-8">
            Stop opening LinkedIn, Naukri, Wellfound, and Indeed in separate tabs every morning.
            Calos pulls live listings from 6 portals into one clean table — filter, save, apply, and track
            everything in one place.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-xs font-semibold rounded hover:bg-primary-600 transition-colors"
            >
              Start for free <ArrowRight size={12} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
            >
              Sign in <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Hero product mockup — Attio-style table */}
        <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-3 px-4 h-9 bg-gray-100 border-b border-gray-300">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            </div>
            <div className="flex items-center gap-2 ml-1">
              <Search size={11} className="text-gray-600" />
              <span className="text-xs text-gray-600">Discover Jobs — 342 listings</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-primary-500/15 border border-primary-500/25 rounded text-primary-400 text-[11px]">
              <RefreshCw size={10} />
              Refresh
            </div>
          </div>

          {/* Table */}
          <table>
            <thead>
              <tr>
                <th className="pl-4">Company</th>
                <th>Role</th>
                <th className="hidden sm:table-cell">Location</th>
                <th className="hidden md:table-cell">Type</th>
                <th className="hidden lg:table-cell pr-4">Portal</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_JOBS.map((j, i) => (
                <tr key={i}>
                  <td className="pl-4 w-40">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ backgroundColor: j.color + '22', color: j.color }}
                      >
                        {j.company[0]}
                      </div>
                      <span className="text-xs font-medium text-gray-800">{j.company}</span>
                    </div>
                  </td>
                  <td className="font-medium text-gray-900">{j.role}</td>
                  <td className="hidden sm:table-cell text-xs text-gray-600">{j.location}</td>
                  <td className="hidden md:table-cell">
                    <span className="text-[11px] bg-gray-300/40 text-gray-600 px-1.5 py-0.5 rounded">{j.type}</span>
                  </td>
                  <td className="hidden lg:table-cell pr-4">
                    <span className={cn('text-[11px] px-1.5 py-0.5 rounded border', PORTAL_BADGE[j.portal] || 'bg-gray-300/30 text-gray-600')}>
                      {j.portal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer row */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-300">
            <span className="text-[11px] text-gray-500">Showing 5 of 342 jobs</span>
            <span className="text-[11px] text-gray-500">Page 1 of 18</span>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="border-t border-gray-300 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[11px] text-primary-500 font-medium uppercase tracking-widest mb-3">Sound familiar?</p>
          <h2
            className="text-2xl font-bold text-gray-900 mb-2 max-w-xl"
            style={{ letterSpacing: '-0.025em' }}
          >
            Job searching across multiple platforms is a full-time job in itself
          </h2>
          <p className="text-sm text-gray-600 mb-8 max-w-lg">
            Most job seekers check 4–6 portals every single day. The effort adds up fast — and it's all manual.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                dot: 'bg-red-400',
                title: '5 tabs, every morning',
                desc: 'LinkedIn has startup roles Naukri doesn\'t. Naukri has MNC listings that aren\'t on LinkedIn. You need to check them all.',
              },
              {
                dot: 'bg-red-400',
                title: 'Missed opportunities',
                desc: 'You skipped Wellfound for 3 days during interview prep. A perfect role opened and closed. It happens to everyone.',
              },
              {
                dot: 'bg-red-400',
                title: 'Applications tracked nowhere',
                desc: 'A spreadsheet here, a notes app there, and your memory for the rest. No wonder things slip through.',
              },
            ].map(({ dot, title, desc }) => (
              <div key={title} className="bg-gray-200 border border-gray-300 rounded p-4">
                <span className={cn('inline-block w-1.5 h-1.5 rounded-full mb-3', dot)} />
                <p className="text-sm font-semibold text-gray-900 mb-1.5" style={{ letterSpacing: '-0.01em' }}>{title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-gray-300 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[11px] text-primary-500 font-medium uppercase tracking-widest mb-3">Features</p>
          <h2
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ letterSpacing: '-0.025em' }}
          >
            Everything you need, nothing you don't
          </h2>
          <p className="text-sm text-gray-600 mb-8 max-w-lg">
            Calos is focused on one thing: making your job search faster and more organised. No bloat, no upsells.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-gray-200 border border-gray-300 rounded p-4 hover:border-gray-400 transition-colors"
              >
                <div className="w-7 h-7 rounded bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-3">
                  <Icon size={14} className="text-primary-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1" style={{ letterSpacing: '-0.01em' }}>{title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portals ── */}
      <section id="portals" className="border-t border-gray-300 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[11px] text-gray-600 font-medium uppercase tracking-widest mb-4">Aggregates from</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PORTALS.map(({ name, cls }) => (
              <span key={name} className={cn('px-3 py-1.5 text-xs font-medium rounded border', cls)}>
                {name}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600">More portals added regularly.</p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-t border-gray-300 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[11px] text-primary-500 font-medium uppercase tracking-widest mb-3">How it works</p>
          <h2
            className="text-2xl font-bold text-gray-900 mb-10"
            style={{ letterSpacing: '-0.025em' }}
          >
            Up and running in 3 steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num}>
                <div className="font-mono text-3xl font-bold text-gray-400 mb-3 leading-none">{num}</div>
                <p className="text-sm font-semibold text-gray-900 mb-1.5" style={{ letterSpacing: '-0.01em' }}>{title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tracker preview ── */}
      <section className="border-t border-gray-300 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] text-primary-500 font-medium uppercase tracking-widest mb-3">Application Tracker</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.025em' }}>
                Track every application in one place
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Click "Track" on any job and it gets logged instantly. Update the status as you progress.
                Add notes, attach links, and never wonder "did I apply to this?" again.
              </p>
              <div className="space-y-2.5">
                {[
                  { status: 'Applied',              color: 'bg-blue-400',    label: 'Applied' },
                  { status: 'Interview Scheduled',  color: 'bg-amber-400',   label: 'Interview scheduled' },
                  { status: 'Offer Received',       color: 'bg-emerald-400', label: 'Offer received' },
                  { status: 'Rejected',             color: 'bg-red-400',     label: 'Rejected / moved on' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', color)} />
                    <span className="text-xs text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini tracker mockup */}
            <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden">
              <div className="flex items-center gap-2 px-4 h-9 bg-gray-100 border-b border-gray-300">
                <ClipboardList size={12} className="text-gray-600" />
                <span className="text-xs text-gray-600">Applications — 8 tracked</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th className="pl-4">Role</th>
                    <th className="hidden sm:table-cell">Company</th>
                    <th className="pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { role: 'Frontend Engineer',     company: 'Stripe',    status: 'Interview Scheduled', sc: 'bg-amber-500/10 text-amber-400' },
                    { role: 'Full-Stack Engineer',   company: 'Notion',    status: 'Applied',             sc: 'bg-blue-500/10 text-blue-400' },
                    { role: 'Product Engineer',      company: 'Razorpay',  status: 'Applied',             sc: 'bg-blue-500/10 text-blue-400' },
                    { role: 'Backend Developer',     company: 'CRED',      status: 'Offer Received',      sc: 'bg-emerald-500/10 text-emerald-400' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="pl-4 font-medium text-gray-900 text-xs">{r.role}</td>
                      <td className="hidden sm:table-cell text-xs text-gray-600">{r.company}</td>
                      <td className="pr-4">
                        <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded', r.sc)}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why I built this ── */}
      <section id="story" className="border-t border-gray-300 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[11px] text-primary-500 font-medium uppercase tracking-widest mb-3">Why I built this</p>
          <h2
            className="text-2xl font-bold text-gray-900 mb-8"
            style={{ letterSpacing: '-0.025em' }}
          >
            A tool I needed, so I built it
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                I was actively job hunting and spending the <strong className="text-gray-900">first hour of every day just checking portals</strong> —
                not applying, just checking. LinkedIn had startup roles that Naukri didn't. Naukri had MNC listings
                not on LinkedIn. Wellfound had remote-first companies I cared about. I had 5 browser tabs
                pinned every morning and still felt like I was missing things.
              </p>
              <p>
                One week, I skipped checking Wellfound for 3 days because I was deep in interview prep.
                Later I found out a company I had been tracking had posted a role — and it closed while I wasn't
                looking. That was the moment I decided to build this.
              </p>
              <p>
                I wanted something simple: <strong className="text-gray-900">pull all the jobs into one place, let me filter them,
                and let me track where I've applied.</strong> No algorithm choosing what to show me.
                No promoted listings. Just a clean table of what's actually available — from all the portals —
                right now.
              </p>
              <p>
                Calos is that tool. I built it for myself first. Now it's free for anyone who's
                going through the same grind.
              </p>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-gray-200 border border-gray-300 rounded p-5 space-y-3">
                <p className="text-[11px] text-gray-600 uppercase tracking-widest font-medium">What this solves</p>
                {[
                  'One place for all job boards',
                  'No missed listings',
                  'Unified application tracking',
                  'Resume + cover letter storage',
                  'Filter without 5 open tabs',
                  'Free, forever',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check size={10} className="text-emerald-400" />
                    </div>
                    <span className="text-xs text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-gray-300 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gray-200 border border-gray-300 rounded p-10 text-center">
            <p className="text-[11px] text-primary-500 font-medium uppercase tracking-widest mb-3">Get started</p>
            <h2
              className="text-2xl font-bold text-gray-900 mb-3"
              style={{ letterSpacing: '-0.025em' }}
            >
              Ready to simplify your job search?
            </h2>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-7">
              Free to use. No credit card. No setup. Start pulling jobs from all portals in under a minute.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded hover:bg-primary-600 transition-colors"
              >
                Create free account <ArrowRight size={14} />
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-300 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 60 60" fill="none" className="shrink-0 text-primary-500">
              <defs><clipPath id="foot-clip"><circle cx="28" cy="30" r="24"/></clipPath></defs>
              <circle cx="28" cy="30" r="26" stroke="currentColor" strokeWidth="3.5"/>
              <circle cx="37" cy="30" r="19" stroke="currentColor" strokeWidth="3.5" clipPath="url(#foot-clip)"/>
              <circle cx="46" cy="30" r="11" stroke="currentColor" strokeWidth="3.5" clipPath="url(#foot-clip)"/>
            </svg>
            <span className="text-xs text-gray-700 font-semibold">Calos</span>
          </div>
          <p className="text-xs text-gray-500">Built because job searching shouldn't feel like a second job.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-gray-600 hover:text-gray-800 transition-colors">Sign in</Link>
            <Link to="/register" className="text-xs text-gray-600 hover:text-gray-800 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
