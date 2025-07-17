import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { DriverWallet } from '@/api/entities';
import { WithdrawalRequest } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { motion } from 'framer-motion';
import { DollarSign, ArrowDown, ArrowUp, History, Banknote } from 'lucide-react';
import BalanceCard from '../components/wallet/BalanceCard';
import WithdrawalForm from '../components/wallet/WithdrawalForm';
import TransactionHistory from '../components/wallet/TransactionHistory';

export default function WalletPage() {
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);

                // Assuming user object has a reference to their role and driver/mitra ID
                // In a real scenario, this might be more complex
                const ownerId = currentUser.id; 

                const [walletData] = await DriverWallet.filter({ owner_id: ownerId });
                setWallet(walletData);

                const transactionData = await Transaction.filter({ owner_id: ownerId }, '-created_date', 50);
                setTransactions(transactionData);

            } catch (error) {
                console.error("Failed to fetch wallet data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleWithdrawalRequest = async (amount) => {
        if (!wallet || !user) return;
        
        try {
            await WithdrawalRequest.create({
                owner_id: user.id,
                wallet_id: wallet.id,
                amount: amount,
                bank_details: wallet.bank_account,
                status: 'pending'
            });
            
            // Optimistically update UI or re-fetch data
            const [walletData] = await DriverWallet.filter({ owner_id: user.id });
            setWallet(walletData);
            
            alert('Permintaan penarikan berhasil dikirim!');
        } catch (error) {
            console.error("Withdrawal failed:", error);
            alert('Permintaan penarikan gagal. Silakan coba lagi.');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!wallet) {
        return (
            <div className="p-6 max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-4">Wallet Tidak Ditemukan</h1>
                <p>Sepertinya Anda belum memiliki wallet. Silakan lengkapi profil Anda sebagai Driver atau Mitra.</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="p-4 md:p-8 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dompet Saya</h1>
                <Banknote className="h-10 w-10 text-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <BalanceCard 
                    title="Saldo Dapat Ditarik" 
                    amount={wallet.available_balance} 
                    icon={DollarSign}
                    color="from-green-400 to-green-600"
                />
                <BalanceCard 
                    title="Saldo Tertunda" 
                    amount={wallet.pending_balance} 
                    icon={History}
                    color="from-yellow-400 to-yellow-600"
                />
                <BalanceCard 
                    title="Total Penarikan" 
                    amount={wallet.total_withdrawals} 
                    icon={ArrowUp}
                    color="from-red-400 to-red-600"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <WithdrawalForm 
                        availableBalance={wallet.available_balance}
                        bankDetails={wallet.bank_account}
                        onSubmit={handleWithdrawalRequest}
                    />
                </div>
                <div className="lg:col-span-2">
                    <TransactionHistory transactions={transactions} />
                </div>
            </div>
        </motion.div>
    );
}