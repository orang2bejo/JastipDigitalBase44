import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Mail, Phone, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ full_name: '', phone: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setFormData({
                    full_name: currentUser.full_name || '',
                    phone: currentUser.phone || ''
                });
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');
        try {
            await User.updateMyUserData(formData);
            setMessage('Profil berhasil diperbarui!');
            // Refetch user to update display
            const updatedUser = await User.me();
            setUser(updatedUser);
        } catch (error) {
            setMessage('Gagal memperbarui profil.');
            console.error("Failed to update profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Memuat profil...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center">Gagal memuat profil pengguna.</div>;
    }

    return (
        <div className="p-4 lg:p-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="w-6 h-6" />
                        Profil Saya
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {message && (
                            <Alert className={message.includes('Gagal') ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-100">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">{user.email}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Nama Lengkap</Label>
                            <Input id="full_name" value={formData.full_name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <Button type="submit" disabled={isSaving} className="w-full">
                            {isSaving ? 'Menyimpan...' : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}