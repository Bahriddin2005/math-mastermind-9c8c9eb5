import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

interface Payment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  card_type: 'UZCARD' | 'HUMO';
  card_number_masked: string | null;
  card_last_4: string | null;
  status: 'pending' | 'otp_sent' | 'confirmed' | 'success' | 'failed' | 'cancelled';
  transaction_id: string | null;
  error_message: string | null;
  created_at: string;
  confirmed_at: string | null;
  user_email?: string;
  user_username?: string;
}

export const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Note: 'payments' table may not exist yet - this is expected behavior
      // @ts-ignore - payments table may not exist in database yet
      let query = supabase
        .from('payments' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        // Table doesn't exist error - show friendly message
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('payments table not found');
          setPayments([]);
          setLoading(false);
          return;
        }
        throw error;
      }

      // Fetch user information for each payment
      if (data && data.length > 0) {
        const paymentsWithUsers = await Promise.all(
          (data as any[]).map(async (payment) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', payment.user_id)
              .single();

            return {
              ...payment,
              user_email: 'N/A',
              user_username: profile?.username || 'N/A',
            };
          })
        );

        setPayments(paymentsWithUsers as Payment[]);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error("To'lovlarni yuklashda xatolik");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualConfirm = async (paymentId: string) => {
    try {
      // @ts-ignore - payments table may not exist in database yet
      const { error } = await supabase
        .from('payments' as any)
        .update({
          status: 'success',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success("To'lov tasdiqlandi");
      fetchPayments();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.transaction_id?.toLowerCase().includes(query) ||
        payment.card_number_masked?.toLowerCase().includes(query) ||
        payment.user_email?.toLowerCase().includes(query) ||
        payment.user_username?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Kutilmoqda', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      otp_sent: { label: 'OTP yuborildi', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      confirmed: { label: 'Tasdiqlandi', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
      success: { label: 'Muvaffaqiyatli', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
      failed: { label: 'Muvaffaqiyatsiz', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
      cancelled: { label: 'Bekor qilindi', className: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const getCardTypeIcon = (cardType: string) => {
    return cardType === 'UZCARD' ? (
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
        U
      </div>
    ) : (
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-sm">
        H
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              To'lovlar boshqaruvi
            </CardTitle>
            <Button onClick={fetchPayments} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yangilash
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Holat bo'yicha filtrlash</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="otp_sent">OTP yuborildi</SelectItem>
                  <SelectItem value="confirmed">Tasdiqlandi</SelectItem>
                  <SelectItem value="success">Muvaffaqiyatli</SelectItem>
                  <SelectItem value="failed">Muvaffaqiyatsiz</SelectItem>
                  <SelectItem value="cancelled">Bekor qilindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Qidirish</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Transaction ID, karta raqami, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Payments List */}
          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                To'lovlar topilmadi
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <Card
                  key={payment.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {getCardTypeIcon(payment.card_type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground">
                              {new Intl.NumberFormat('uz-UZ').format(payment.amount)} {payment.currency}
                            </span>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              <span className="font-medium">Karta:</span> {payment.card_number_masked || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Transaction ID:</span> {payment.transaction_id || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Foydalanuvchi:</span> {payment.user_username} ({payment.user_email})
                            </div>
                            <div>
                              <span className="font-medium">Vaqt:</span> {formatDate(payment.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManualConfirm(payment.id);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Tasdiqlash
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayment(payment);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {payment.error_message && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600">
                        <strong>Xatolik:</strong> {payment.error_message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Payment Details Modal */}
          {selectedPayment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>To'lov tafsilotlari</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPayment(null)}
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">ID</Label>
                      <p className="font-mono text-sm">{selectedPayment.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Transaction ID</Label>
                      <p className="font-mono text-sm">{selectedPayment.transaction_id || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Summa</Label>
                      <p className="font-bold">
                        {new Intl.NumberFormat('uz-UZ').format(selectedPayment.amount)} {selectedPayment.currency}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Holat</Label>
                      <div>{getStatusBadge(selectedPayment.status)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Karta turi</Label>
                      <p>{selectedPayment.card_type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Karta raqami</Label>
                      <p className="font-mono">{selectedPayment.card_number_masked || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Yaratilgan</Label>
                        <p>{formatDate(selectedPayment.created_at)}</p>
                    </div>
                    {selectedPayment.confirmed_at && (
                      <div>
                        <Label className="text-muted-foreground">Tasdiqlangan</Label>
                        <p>{formatDate(selectedPayment.confirmed_at)}</p>
                      </div>
                    )}
                  </div>
                  {selectedPayment.error_message && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                      <Label className="text-red-600">Xatolik xabari</Label>
                      <p className="text-sm text-red-600">{selectedPayment.error_message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

