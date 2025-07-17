import React from 'react';
import { motion } from 'framer-motion';

export default function BalanceCard({ title, amount, icon: Icon, color }) {
    return (
        <motion.div 
            className={`p-6 rounded-2xl shadow-lg text-white ${color} relative overflow-hidden`}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Icon className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-4xl font-bold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0)}
                </p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        </motion.div>
    );
}