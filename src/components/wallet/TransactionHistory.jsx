
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const transactionIcons = {
    order_payment: <ShoppingCart className="w-5 h-5 text-blue-500" />,
    driver_payout: <ArrowDownCircle className="w-5 h-5 text-green-500" />,
    withdrawal: <ArrowUpCircle className="w-5 h-5 text-red-500" />,
};

const transactionTexts = {
    order_payment: "Pembayaran Pesanan",
    driver_payout: "Pendapatan dari Pesanan",
    withdrawal: "Penarikan Dana",
    commission: "Potongan Komisi",
    refund: "Pengembalian Dana"
}

export default function TransactionHistory({ transactions }) {
    return (
        <Card className="shadow-xl">
            <CardHeader>
                <CardTitle>Riwayat Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[450px]">
                    <div className="space-y-4">
                        {transactions.length > 0 ? transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    {transactionIcons[tx.transaction_type] || <ShoppingCart className="w-5 h-5" />}
                                    <div>
                                        <p className="font-semibold">{transactionTexts[tx.transaction_type] || 'Transaksi'}</p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(tx.created_date), 'd MMMM yyyy, HH:mm', { locale: id })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.transaction_type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.transaction_type === 'withdrawal' ? '-' : '+'} 
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount || 0)}
                                    </p>
                                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                                        {tx.status}
                                    </Badge>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-10">Belum ada transaksi.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
