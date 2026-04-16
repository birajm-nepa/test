"use client"

import { motion } from 'framer-motion'
import { LineChart, Globe, MapPin, Users } from 'lucide-react'

const upcomingFeatures = [
  {
    icon: <LineChart className="h-6 w-6 text-blue-600" />,
    title: "Advanced Analytics",
    description: "Deep insights into sales trends, profitability, and inventory health.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <Globe className="h-6 w-6 text-orange-600" />,
    title: "Localization",
    description: "Full Nepali language support and Bikram Sambat (B.S.) date integration.",
    bgColor: "bg-orange-50"
  },
  {
    icon: <MapPin className="h-6 w-6 text-purple-600" />,
    title: "Multi-branch Sync",
    description: "Manage multiple physical locations from a single unified dashboard.",
    bgColor: "bg-purple-50"
  },
  {
    icon: <Users className="h-6 w-6 text-pink-600" />,
    title: "Patient Profiles",
    description: "Track chronic medication usage and implement loyalty reward programs.",
    bgColor: "bg-pink-50"
  }
]

export function RoadmapSection() {
  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Coming Soon</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Our Vision for the Future
          </p>
          <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto">
            We are constantly evolving. Here is a sneak peek at the exciting new features on our roadmap.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {upcomingFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
