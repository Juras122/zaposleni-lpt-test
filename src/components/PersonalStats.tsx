import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Clock, Moon, Sunset, Sun, Coffee } from 'lucide-react';
import { WorkHour } from '@/types';
import { useMemo } from 'react';

interface PersonalStatsProps {
  workHours: WorkHour[];
}

export const PersonalStats = ({ workHours }: PersonalStatsProps) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];

  // Filtriraj ure za trenutni mesec
  const currentMonthWorkHours = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    return workHours.filter((wh) => {
      if (!wh.datum || typeof wh.datum !== 'string') return false;

      // Podpora za oba formata: "YYYY-MM-DD" ali "DD.MM.YYYY"
      let year: number, month: number;
      
      if (wh.datum.includes('-')) {
        // Format: YYYY-MM-DD
        const [y, m] = wh.datum.split('-');
        year = parseInt(y);
        month = parseInt(m);
      } else {
        // Format: DD.MM.YYYY
        const parts = wh.datum.split('.');
        if (parts.length !== 3) return false;
        year = parseInt(parts[2]);
        month = parseInt(parts[1]);
      }

      return year === currentYear && month === currentMonth;
    });
  }, [workHours]);

  // Procesiranje mesečnih podatkov iz workHours
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, number>();

    workHours.forEach((wh) => {
      // Preveri, če datum obstaja in je pravilnega formata
      if (!wh.datum || typeof wh.datum !== 'string') {
        return;
      }

      let year: string, month: string;

      // Podpora za oba formata: "YYYY-MM-DD" ali "DD.MM.YYYY"
      if (wh.datum.includes('-')) {
        // Format: YYYY-MM-DD
        const parts = wh.datum.split('-');
        if (parts.length !== 3) return;
        year = parts[0];
        month = parts[1];
      } else {
        // Format: DD.MM.YYYY
        const parts = wh.datum.split('.');
        if (parts.length !== 3) return;
        year = parts[2];
        month = parts[1];
      }

      const monthKey = `${year}-${month.padStart(2, '0')}`;
      const hours = parseFloat(wh.stevilo) || 0;

      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + hours);
    });

    // Sort by year-month and convert to chart format
    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, ure]) => {
        const [year, month] = key.split('-');
        const monthIndex = parseInt(month) - 1;
        return {
          mesec: `${monthNames[monthIndex]} ${year}`,
          ure: Math.round(ure)
        };
      });
  }, [workHours]);

  // Procesiranje letnih podatkov iz workHours
  const yearlyData = useMemo(() => {
    const yearlyMap = new Map<string, number>();

    workHours.forEach((wh) => {
      // Preveri, če datum obstaja in je pravilnega formata
      if (!wh.datum || typeof wh.datum !== 'string') {
        return;
      }

      let year: string;

      // Podpora za oba formata: "YYYY-MM-DD" ali "DD.MM.YYYY"
      if (wh.datum.includes('-')) {
        // Format: YYYY-MM-DD
        const parts = wh.datum.split('-');
        if (parts.length !== 3) return;
        year = parts[0];
      } else {
        // Format: DD.MM.YYYY
        const parts = wh.datum.split('.');
        if (parts.length !== 3) return;
        year = parts[2];
      }

      const hours = parseFloat(wh.stevilo) || 0;
      yearlyMap.set(year, (yearlyMap.get(year) || 0) + hours);
    });

    // Sort by year and convert to chart format
    return Array.from(yearlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([leto, ure]) => ({
        leto,
        ure: Math.round(ure)
      }));
  }, [workHours]);

  // Statistika ur
  const hourStats = {
    dnevne: 120,
    nocne: 16,
    popoldanske: 48,
    nadure: 12,
  };

  // Dopust
  const dopust = {
    porabljen: 8,
    razpolozljiv: 22,
    skupaj: 30,
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-top duration-300">
      <Card className="p-6 shadow-elegant">
        <h3 className="text-lg font-semibold mb-4">Osebna statistika</h3>

        <Tabs defaultValue="grafi" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grafi">Grafi</TabsTrigger>
            <TabsTrigger value="ure">Ure</TabsTrigger>
            <TabsTrigger value="dopust">Dopust</TabsTrigger>
            <TabsTrigger value="pregled">Pregled</TabsTrigger>
          </TabsList>

          <TabsContent value="grafi" className="space-y-4 mt-4">
            {monthlyData.length === 0 && yearlyData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Ni podatkov za prikaz</p>
              </div>
            ) : (
              <>
                {monthlyData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Mesečni pregled ur
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="mesec" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Bar dataKey="ure" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {yearlyData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Letni pregled ur
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="leto" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ure" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="ure" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 border-2 border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sun className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dnevne ure</p>
                    <p className="text-xl font-bold">{hourStats.dnevne}h</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-2 border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Moon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nočne ure</p>
                    <p className="text-xl font-bold">{hourStats.nocne}h</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-2 border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sunset className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Popoldanske</p>
                    <p className="text-xl font-bold">{hourStats.popoldanske}h</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-2 border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Coffee className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nadure</p>
                    <p className="text-xl font-bold">{hourStats.nadure}h</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dopust" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Porabljen dopust</p>
                  <p className="text-2xl font-bold text-primary">{dopust.porabljen} dni</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Razpoložljiv dopust</p>
                  <p className="text-2xl font-bold text-accent">{dopust.razpolozljiv} dni</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Skupaj dopusta</span>
                  <span className="font-medium">{dopust.skupaj} dni</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-smooth"
                    style={{ width: `${(dopust.porabljen / dopust.skupaj) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pregled" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {currentMonthWorkHours.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Ni podatkov za trenutni mesec</p>
                </div>
              ) : (
                currentMonthWorkHours.map((wh) => (
                  <div
                    key={wh.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/5 transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{wh.dan}</p>
                        <p className="text-xs text-muted-foreground">{wh.datum}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{wh.stevilo}h</p>
                      <p className="text-xs text-muted-foreground">{wh.prihod} - {wh.odhod}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
