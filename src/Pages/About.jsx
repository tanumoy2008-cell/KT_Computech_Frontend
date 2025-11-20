import React from "react";
import Navbar from "../components/Navbar";
const team = [
  {
    name: "Tanumoy Ghosh",
    role: "Co-Founder & CEO",
    bio: "Leads KT Computech Stationery's vision of bringing quality stationery online.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687"
  },
  {
    name: "Karabi RoyGhosh",
    role: "Co-Founder & Managing Director",
    bio: "Oversees operations, sourcing and customer experience for the stationery store.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
  },
  {
    name: "Suvam Chakraborti",
    role: "Head of Development",
    bio: "Builds and maintains the technical backbone for our online shop and integrations.",
    img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880"
  }
];

const services = [
  {
    title: "Online Stationery Store",
    desc: "Seamless shopping for pens, notebooks, art supplies and office essentials."
  },
  {
    title: "Bulk & Wholesale Orders",
    desc: "Special pricing and packing for schools, offices and resellers."
  },
  {
    title: "POS & Inventory Integration",
    desc: "Sync online orders with in-store stock for accurate inventory."
  },
  {
    title: "Customer Support & Delivery",
    desc: "Friendly support and reliable delivery across India."
  }
];

const About = () => {
  return (
    <main className="bg-gray-50 text-gray-900">
      <Navbar />
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-600 text-white pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex gap-12 items-center">
          <div>
            <h1 className="text-5xl font-extrabold whitespace-nowrap font-PublicSans">KT Computech Stationery</h1>
            <p className="mt-4 text-xl max-w-xl">
              Your trusted online destination for stationery and office supplies across India.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/shop" className="bg-white text-green-700 px-4 py-2 rounded font-semibold">
                Shop now
              </a>
              <a href="/contact" className="border border-white/40 px-4 py-2 rounded">
                Contact us
              </a>
            </div>
          </div>

          <div className="hidden lg:block w-[60%]">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3"
              alt="Stationery products and team"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-6xl font-semibold">Our mission</h2>
            <p className="mt-4 text-gray-700">
              To make high-quality stationery affordable and easily available to customers across India, backed by
              reliable service and quick delivery.
            </p>

            <h3 className="mt-6 text-2xl font-medium">Why customers choose us</h3>
            <ul className="mt-3 list-disc list-inside text-gray-700 space-y-1">
              <li>Wide catalog of curated stationery products.</li>
              <li>Competitive pricing and bulk discounts.</li>
              <li>Fast delivery & responsive customer support.</li>
            </ul>
          </div>

          <aside className="bg-white rounded-xl p-5 shadow-2xl shadow-green-500/60 border-1 border-green-500/50">
            <h4 className="font-semibold text-xl">Quick facts</h4>
            <div className="mt-4 grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <div className="text-sm text-gray-500">Clients</div>
                <div className="text-lg font-medium">10+</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Years</div>
                <div className="text-lg font-medium">1+</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Support</div>
                <div className="text-lg font-medium">24/7</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Delivery</div>
                <div className="text-lg font-medium">Durgapur, West Bengal</div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-semibold">What we offer</h2>
          <p className="mt-2 text-gray-600">Products and services tailored for students, professionals and businesses.</p>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="rounded-lg p-4 shadow-2xl shadow-green-500/60 border-1 border-green-500/50 bg-gray-50">
                <h4 className="font-semibold">{s.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <h2 className="text-4xl font-semibold">Meet the team</h2>
        <p className="mt-2 text-gray-600">Small team, big experience.</p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((m) => (
            <div key={m.name} className="bg-white rounded-xl p-4 shadow-2xl shadow-green-500/60 border-1 border-green-500/50 flex items-center gap-4">
              <img
                src={m.img}
                alt={m.name}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-gray-500">{m.role}</div>
                <div className="mt-2 text-sm text-gray-600">{m.bio}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-green-700 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Ready to stock up?</h3>
            <p className="mt-1">Get special prices for bulk orders and schools — reach out for a custom quote.</p>
          </div>
          <div className="flex gap-3">
            <a href="/contact" className="bg-white text-emerald-700 px-4 py-2 rounded font-semibold">Contact us</a>
            <a href="/bulk" className="border border-white/40 px-4 py-2 rounded">Bulk orders</a>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t py-6">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-sm text-gray-600 flex flex-col sm:flex-row justify-between">
          <div>© {new Date().getFullYear()} KT Computech Stationery — All rights reserved.</div>
          <div className="mt-2 sm:mt-0">Support: ktcomputechs@gmail.com</div>
        </div>
      </footer>
    </main>
  );
};

export default About;
