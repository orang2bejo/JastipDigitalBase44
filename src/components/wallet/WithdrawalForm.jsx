import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Banknote } from 'lucide-react';

export default function WithdrawalForm({ availableBalance, bankDetails, onSubmit }) {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const withdrawalAmount = parseFloat(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            setError('Jumlah tidak valid.');
            return;
        }
        if (withdrawalAmount > availableBalance) {
            setError('Saldo tidak mencukupi.');
            return;
        }
        if (withdrawalAmount < 50000) {
            setError('Penarikan minimum adalah Rp 50.000.');
            return;
        }
        setError('');
        onSubmit(withdrawalAmount);
        setAmount('');
    };

    return (
        <Card className="shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Banknote className="text-blue-500" />
                    Tarik Dana
                </CardTitle>
                <CardDescription>Tarik dana ke rekening bank Anda.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="amount">Jumlah Penarikan (IDR)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g., 100000"
                        />
                         {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    {bankDetails ? (
                         <div className="text-sm p-3 bg-gray-100 rounded-lg">
                            <p className="font-semibold">{bankDetails.bank_name}</p>
                            <p>{bankDetails.account_number}</p>
                            <p>a.n. {bankDetails.account_name}</p>
                        </div>
                    ) : (
                        <div className="text-sm p-3 bg-yellow-100 text-yellow-800 rounded-lg">
                            Harap lengkapi detail rekening bank Anda di halaman profil.
                        </div>
                    )}
                   
                    <Button type="submit" className="w-full" disabled={!bankDetails || !amount}>
                        Kirim Permintaan Penarikan
                    </Button>
                </form>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-gray-500">
                    Penarikan akan diproses dalam 1-2 hari kerja. Fee transfer antar bank mungkin berlaku.
                </p>
            </CardFooter>
        </Card>
    );
}