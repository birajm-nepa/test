"use client"

import { motion } from 'framer-motion'
import { Activity, ShieldCheck, Calculator } from 'lucide-react'

const features = [
  {
    icon: <Calculator className="h-6 w-6 text-indigo-600" />,
    title: "Nepal VAT & Billing",
    description: "Automatically calculates Non-Taxable, Taxable amounts, and strictly enforces 13% VAT. Built using Prisma Decimal to entirely prevent NPR rounding errors.",
    bgColor: "bg-indigo-50"
  },
  {
    icon: <Activity className="h-6 w-6 text-green-600" />,
    title: "FEFO Inventory Logic",
    description: "Intelligently suggests and deducts from batches based on First-Expire-First-Out (FEFO) rules. Visually flags expiring medicines in the POS.",
    bgColor: "bg-green-50"
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-red-600" />,
    title: "DDA Narcotic Compliance",
    description: "Strict validations for Class A drugs. The system enforces Doctor NMC Number and Patient Phone Number entry before allowing the generation of a narcotic invoice.",
    bgColor: "bg-red-50"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-50 py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Core Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to run a modern pharmacy.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-xl"
            >
              <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
