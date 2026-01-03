import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import Markdown from "markdown-to-jsx";

// fallback demo team
const team = [
  {
    name: "Tanumoy Ghosh",
    role: "Co-Founder & CEO",
    bio: "Leads KT Computech Stationery's vision of bringing quality stationery online.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
];

// ✨ formatter to support your textarea markdown style
const formatMarkdown = (text = "") =>
  text
    // >> becomes a highlighted sub heading (##)
    .replace(/^>>\s?/gm, "## ")
    // <br> -> real newline
    .replace(/<br\s*\/?>/gi, "\n")
    // trim extra spaces
    .trim();

const About = () => {
  const shop = useSelector((state) => state.ShopReducer.shopData);
  const displayedTeam = shop?.team?.length ? shop.team : team;

  return (
    <main className="bg-gray-50 text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-600 text-white pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold whitespace-nowrap font-PublicSans">
              {shop?.name || "KT Computech Stationery"}
            </h1>

            <p className="mt-4 text-xl max-w-3xl">
              {shop?.shortDescription ||
                "Your trusted destination for stationery and office supplies across India."}
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="/shop"
                className="bg-white text-green-700 px-4 py-2 rounded font-semibold">
                Shop now
              </a>
              <a
                href="/contact"
                className="border border-white/40 px-4 py-2 rounded">
                Contact us
              </a>
            </div>
          </div>

          <div className="hidden lg:block w-[60%]">
            <img
              src={
                shop?.logo ||
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
              }
              alt={shop?.name || "Stationery products and team"}
              className="w-full h-74 object-contain rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Mission / Description */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 pr-0 lg:pr-20">
            <Markdown
              className="prose prose-lg prose-emerald max-w-none"
              options={{
                overrides: {
                  h1: {
                    props: {
                      className:
                        "text-3xl md:text-4xl font-bold mt-4 mb-2 flex items-center gap-2",
                    },
                  },
                  h2: {
                    props: {
                      className: "text-2xl md:text-3xl font-semibold mt-3 mb-2",
                    },
                  },
                  p: {
                    props: {
                      className: "leading-relaxed",
                    },
                  },
                },
              }}>
              {formatMarkdown(shop?.description || "")}
            </Markdown>
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-semibold">What we offer</h2>
          <p className="mt-2 text-gray-600">
            Products and services tailored for students, professionals and
            businesses.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shop?.services?.map((s) => (
              <div
                key={s.title}
                className="rounded-lg p-4 shadow-2xl shadow-green-500/60 border-1 border-green-500/50 bg-gray-50">
                <h4 className="font-semibold">{s.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <h2 className="text-4xl font-semibold">Meet the team</h2>
        <p className="mt-2 text-gray-600">Small team, big experience.</p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTeam.map((m) => (
            <div
              key={m.name}
              className="bg-white rounded-xl p-4 shadow-2xl shadow-green-500/60 border-1 border-green-500/50 flex items-center gap-4">
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
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-green-700 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Ready to stock up?</h3>
            <p className="mt-1">
              Get special prices for bulk orders and schools — reach out for a
              custom quote.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/contact"
              className="bg-white text-emerald-700 px-4 py-2 rounded font-semibold">
              Contact us
            </a>
            <a
              href="/bulk"
              className="border border-white/40 px-4 py-2 rounded">
              Bulk orders
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default About;
