export default function Home() {
  return (
    <main className="bg-white text-gray-900">

      {/* TOP BAR */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center text-xs">
          <span className="font-semibold tracking-wide">
            ROOFFLOW DEMAND NETWORK
          </span>
          <span className="text-red-600 font-semibold">
            Limited contractor density per territory
          </span>
        </div>
      </div>

      {/* HERO */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <p className="text-sm text-gray-500 uppercase tracking-wider">
            Verified homeowner demand system
          </p>

          <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight">
            Roofing Jobs Delivered <br />
            Directly Into Your Schedule
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            RoofFlow connects you with verified homeowners actively requesting roofing estimates in your territory.
            No shared leads. No ad spend waste. No cold traffic.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/apply"
              className="bg-black text-white px-8 py-4 rounded-xl font-semibold"
            >
              Check Territory Access →
            </a>

            <a
              href="#how"
              className="border px-8 py-4 rounded-xl font-medium"
            >
              See how it works
            </a>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Territory approval required • Capacity-controlled contractor network
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">

          <div>
            <p className="text-3xl font-bold">+217%</p>
            <p className="text-gray-500 text-sm mt-2">
              Average revenue lift within first 90 days
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold">4.9/5</p>
            <p className="text-gray-500 text-sm mt-2">
              Contractor satisfaction rating
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-gray-500 text-sm mt-2">
              Shared leads — fully exclusive territory access
            </p>
          </div>

        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl md:text-4xl font-bold">
            Why most contractors stay stuck in expensive lead systems
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Most lead sources optimize for volume — not booking intent or job readiness.
          </p>

          <div className="mt-14 grid md:grid-cols-3 gap-8 text-left">

            <div className="border p-6 rounded-xl">
              <p className="font-semibold">Paid Ads</p>
              <p className="text-gray-500 text-sm mt-2">
                Rising CPC, unpredictable conversion rates, and low buyer intent traffic.
              </p>
            </div>

            <div className="border p-6 rounded-xl">
              <p className="font-semibold">Shared Lead Platforms</p>
              <p className="text-gray-500 text-sm mt-2">
                Multiple contractors compete for the same homeowner inquiry.
              </p>
            </div>

            <div className="border p-6 rounded-xl">
              <p className="font-semibold">Low Intent Forms</p>
              <p className="text-gray-500 text-sm mt-2">
                Most submissions are price shoppers, not ready-to-book customers.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl md:text-4xl font-bold">
            How RoofFlow operates
          </h2>

          <div className="mt-14 grid md:grid-cols-3 gap-8 text-left">

            <div className="bg-white p-6 rounded-xl border">
              <p className="font-bold">1. Intent Detection</p>
              <p className="text-gray-500 text-sm mt-2">
                We identify homeowners actively requesting roofing estimates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <p className="font-bold">2. Qualification Filtering</p>
              <p className="text-gray-500 text-sm mt-2">
                Each lead is scored based on urgency, property signals, and readiness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <p className="font-bold">3. Appointment Delivery</p>
              <p className="text-gray-500 text-sm mt-2">
                Only high-intent, booking-ready opportunities are delivered.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl md:text-4xl font-bold">
            Contractors using RoofFlow
          </h2>

          <div className="mt-14 grid md:grid-cols-3 gap-8 text-left">

            <div className="border p-6 rounded-xl">
              <p className="text-sm text-gray-600">
                “First 3 leads turned into $38K in booked roofing work.”
              </p>
              <p className="mt-4 font-semibold">— Calgary Roofing Contractor</p>
            </div>

            <div className="border p-6 rounded-xl">
              <p className="text-sm text-gray-600">
                “Higher intent than anything we got from Google Ads.”
              </p>
              <p className="mt-4 font-semibold">— Edmonton Exterior Co.</p>
            </div>

            <div className="border p-6 rounded-xl">
              <p className="text-sm text-gray-600">
                “We fully replaced shared lead platforms.”
              </p>
              <p className="mt-4 font-semibold">— Rockies Roofing Group</p>
            </div>

          </div>
        </div>
      </section>

      {/* OBJECTIONS */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center">
            Common questions
          </h2>

          <div className="mt-10 space-y-6">

            <div>
              <p className="font-semibold">Are leads shared with other contractors?</p>
              <p className="text-gray-500 text-sm mt-1">
                No. Each territory is assigned to a limited number of contractors.
              </p>
            </div>

            <div>
              <p className="font-semibold">How fast do leads come in?</p>
              <p className="text-gray-500 text-sm mt-1">
                Most contractors receive their first opportunities within 24–72 hours.
              </p>
            </div>

            <div>
              <p className="font-semibold">Is this paid advertising?</p>
              <p className="text-gray-500 text-sm mt-1">
                No. This is intent-based homeowner demand, not ad traffic.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 text-center">
        <div className="max-w-3xl mx-auto px-6">

          <h2 className="text-3xl md:text-4xl font-bold">
            Check if your territory is available
          </h2>

          <p className="mt-4 text-gray-600">
            Contractor capacity is limited per region to preserve lead quality and conversion rates.
          </p>

          <div className="mt-10">
            <a
              href="/apply"
              className="bg-black text-white px-10 py-4 rounded-xl font-semibold text-lg"
            >
              Check Availability →
            </a>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            No contracts • Approval within 24 hours • Performance-based activation
          </p>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 text-center text-xs text-gray-400">
        RoofFlow Demand Network © 2026
      </footer>

    </main>
  );
}
