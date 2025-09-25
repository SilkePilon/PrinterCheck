'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { mockCreditTransactions } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Plus,
  Minus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  History,
  ShoppingCart,
} from 'lucide-react';
import type { CreditTransaction } from '@/lib/types';

export default function Credits() {
  const { data: session } = useSession();
  const { creditTransactions, setCreditTransactions } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    setCreditTransactions(mockCreditTransactions);
  }, [setCreditTransactions]);

  const userId = session?.user?.id;
  const userCredits = session?.user?.credits || 0;

  // Filter transactions for the current user
  const userTransactions = creditTransactions.filter(transaction => transaction.userId === userId);

  // Filter by selected period
  const filterTransactionsByPeriod = (transactions: CreditTransaction[]) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        return transactions;
    }
    
    return transactions.filter(transaction => 
      new Date(transaction.createdAt) >= cutoffDate
    );
  };

  const filteredTransactions = filterTransactionsByPeriod(userTransactions);

  // Calculate statistics
  const totalSpent = userTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalEarned = userTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthSpent = filterTransactionsByPeriod(userTransactions.filter(t => t.amount < 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'print_job':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'admin_adjustment':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Aankoop';
      case 'print_job':
        return '3D Print';
      case 'refund':
        return 'Terugbetaling';
      case 'admin_adjustment':
        return 'Administratieve aanpassing';
      default:
        return type;
    }
  };

  const statsCards = [
    {
      title: 'Huidige Credits',
      value: userCredits,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Totaal Uitgegeven',
      value: totalSpent,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Totaal Ontvangen',
      value: totalEarned,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Deze Maand Uitgegeven',
      value: thisMonthSpent,
      icon: History,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Credits Overzicht</h1>
        <p className="text-muted-foreground">
          Beheer je 3D print credits en bekijk je uitgavengeschiedenis.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Credit Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Credits Kopen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">Starterpack</h3>
                <div className="text-2xl font-bold">25 Credits</div>
                <p className="text-sm text-muted-foreground">€12.50</p>
                <Button className="w-full" variant="outline">
                  Koop Credits
                </Button>
              </div>
            </Card>
            <Card className="p-4 border-primary">
              <Badge className="mb-2">Populair</Badge>
              <div className="text-center space-y-2">
                <h3 className="font-semibold">Standaard Pack</h3>
                <div className="text-2xl font-bold">50 Credits</div>
                <p className="text-sm text-muted-foreground">€22.50</p>
                <Button className="w-full">
                  Koop Credits
                </Button>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">Premium Pack</h3>
                <div className="text-2xl font-bold">100 Credits</div>
                <p className="text-sm text-muted-foreground">€40.00</p>
                <Button className="w-full" variant="outline">
                  Koop Credits
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Transactie Geschiedenis</span>
            </CardTitle>
              <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month' | 'all')}>
              <TabsList>
                <TabsTrigger value="week">Deze Week</TabsTrigger>
                <TabsTrigger value="month">Deze Maand</TabsTrigger>
                <TabsTrigger value="all">Alles</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-sm font-semibold">Geen transacties gevonden</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Er zijn geen transacties in de geselecteerde periode.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Beschrijving</TableHead>
                    <TableHead>Bedrag</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="text-sm">
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount >= 0 ? '+' : ''}{transaction.amount} credits
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString('nl-NL', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips voor Credit Gebruik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Bespaar Credits:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Optimaliseer je 3D modellen voor minder materiaal gebruik</li>
                <li>• Print meerdere kleine onderdelen tegelijk</li>
                <li>• Kies de juiste printer voor je project</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Credit Kosten:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Kleine prints (&lt; 2 uur): 5-10 credits</li>
                <li>• Middelgrote prints (2-6 uur): 10-25 credits</li>
                <li>• Grote prints (&gt; 6 uur): 25+ credits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}