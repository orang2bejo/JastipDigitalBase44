import React, { useState, useEffect } from 'react';
import { DriverWallet } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function DriverWalletDashboard() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        try {
            const user = await User.me();
            const [walletData] = await DriverWallet.filter({ driver_id: user.id });
            setWallet(walletData);
        } catch (error) {
            console.error("Error loading wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading wallet data...</div>;
    }

    if (!wallet) {
        return <div>Wallet not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Tersedia</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            Rp {(wallet.available_balance || 0).toLocaleString('id-ID')}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            Rp {(wallet.pending_balance || 0).toLocaleString('id-ID')}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Penghasilan</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            Rp {(wallet.total_earnings || 0).toLocaleString('id-ID')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Rekening Bank</CardTitle>
                </CardHeader>
                <CardContent>
                    {wallet.bank_account ? (
                        <div className="space-y-2">
                            <p><strong>Bank:</strong> {wallet.bank_account.bank_name}</p>
                            <p><strong>Nomor Rekening:</strong> {wallet.bank_account.account_number}</p>
                            <p><strong>Nama Pemilik:</strong> {wallet.bank_account.account_name}</p>
                            <p><strong>Status:</strong> {wallet.bank_account.is_verified ? 'Terverifikasi' : 'Belum Diverifikasi'}</p>
                        </div>
                    ) : (
                        <p>Belum ada informasi rekening bank</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}