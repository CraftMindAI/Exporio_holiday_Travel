import Link from 'next/link';
import { ArrowLeft, CalendarCheck, Users, Map, PartyPopper, Wallet, ShieldCheck, Compass, HeartHandshake } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { JoinGroupTripButton, StrangerTripTours } from '@/components/StrangerTripActions';
import { getAllTours } from '@/lib/data';
import { breadcrumbJsonLd, staticPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata = staticPageMetadata({
  title: 'Stranger Trip - Group Tours for Solo Travellers',
  description:
    'Travelling solo? Join an Exporio Holidays Stranger Trip: small group tours with like-minded travellers to Sikkim, Kashmir, Kerala, Bhutan and more. Shared costs, planned itineraries, new friends.',
  path: '/stranger-trip/',
  keywords: ['stranger trip', 'group tour for solo travellers', 'solo travel India', 'join group trip', 'backpacking group tour', 'travel with strangers', 'Exporio Holidays group trips'],
});

const STEPS = [
  { icon: CalendarCheck, title: 'Pick a trip', text: 'Choose a destination and the dates that suit you, or tell us where you want to go.' },
  { icon: Users, title: 'Join a group', text: 'We place you with other travellers heading to the same destination on the same dates.' },
  { icon: Map, title: 'We plan everything', text: 'Stays, transfers, sightseeing and the day-by-day itinerary are arranged by our team.' },
  { icon: PartyPopper, title: 'Travel together', text: 'Meet your group, explore together and come home with new friends and stories.' },
];

const BENEFITS = [
  { icon: Compass, title: 'Made for solo travellers', text: 'No need to find a travel buddy. Book on your own and still travel in company.' },
  { icon: Wallet, title: 'Shared costs', text: 'Splitting vehicles and rooms with the group keeps the trip easier on your budget.' },
  { icon: ShieldCheck, title: 'Planned & supported', text: 'A planned itinerary and our team on call while you travel.' },
  { icon: HeartHandshake, title: 'Real connections', text: 'Travel with people who love exploring as much as you do.' },
];

const FAQS = [
  { q: 'Can I join a Stranger Trip on my own?', a: 'Yes. Stranger Trips are designed for people travelling solo. You book just for yourself and join a group on the same departure.' },
  { q: 'Can I book with friends?', a: 'Of course. You can join as a pair or a small group of friends and travel alongside other travellers.' },
  { q: 'How big are the groups?', a: 'Groups are kept small. Send us an enquiry and we will tell you the group size and dates for the trip you are interested in.' },
  { q: 'How do I join?', a: 'Click "Join a Group Trip", tell us your preferred destination, dates and number of travellers, and our team will call you with the available departures.' },
];

export default async function StrangerTripPage() {
  const tours = await getAllTours();
  const featured = (tours.filter((t) => t.isFeatured || t.isTrending).length ? tours.filter((t) => t.isFeatured || t.isTrending) : tours).slice(0, 6);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white overflow-hidden">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Stranger Trip', path: '/stranger-trip/' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          },
        ]}
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primaryCyan/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan font-bold hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-primaryCyan bg-primaryCyan/10 px-3 py-1 rounded-full mb-4 border border-primaryCyan/20">
            <Users className="w-4 h-4" /> Group trips for solo travellers
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Stranger <span className="text-primaryCyan">Trip</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-lg mb-8">
            Travel solo, explore together. Join a small group of like-minded travellers on a planned trip, share the costs, and leave as friends.
          </p>
          <JoinGroupTripButton />
        </section>

        {/* How it works */}
        <section className="mb-14" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl md:text-3xl font-black text-center mb-8">How it works</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-navyDark/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-xl bg-primaryCyan/15 text-primaryCyan flex items-center justify-center">
                    <step.icon className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Step {i + 1}</span>
                </div>
                <h3 className="font-extrabold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Why */}
        <section className="mb-14" aria-labelledby="why-stranger-trip">
          <h2 id="why-stranger-trip" className="text-2xl md:text-3xl font-black text-center mb-8">Why join a Stranger Trip?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-navyDark/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5">
                <b.icon className="w-6 h-6 text-primaryCyan mb-3" />
                <h3 className="font-extrabold text-white mb-1">{b.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trips */}
        {featured.length > 0 && (
          <section className="mb-14" aria-labelledby="group-trips">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <h2 id="group-trips" className="text-2xl md:text-3xl font-black">Popular trips to join</h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">Enquire on any trip and we will match you with a group on your dates.</p>
              </div>
            </div>
            <StrangerTripTours tours={featured} />
          </section>
        )}

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-14" aria-labelledby="stranger-trip-faq">
          <h2 id="stranger-trip-faq" className="text-2xl md:text-3xl font-black text-center mb-6">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-navyDark/60 border border-slate-700/50 rounded-xl p-4 open:border-primaryCyan/40">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-bold text-sm text-white">
                  {f.q}
                  <span className="text-primaryCyan text-lg leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="text-xs text-slate-300 leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-navyDark/60 border border-slate-700/50 rounded-2xl p-8 max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black mb-2">Ready to meet your travel tribe?</h2>
          <p className="text-sm text-slate-300 mb-6">Tell us where and when, and we will find you a group.</p>
          <JoinGroupTripButton label="Find My Group" />
        </section>
      </div>
    </div>
  );
}
