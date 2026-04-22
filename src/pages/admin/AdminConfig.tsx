import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminConfig() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Ajustes da plataforma</p>
      </div>
      <Card className="surface-1 border-border/50 p-12 text-center">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold mb-1">Configurações em breve</h3>
        <p className="text-sm text-muted-foreground">Aqui você poderá ajustar taxas, banners e categorias.</p>
      </Card>
    </div>
  );
}
