import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Plus, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface Category {
  id: string;
  nome: string;
  slug: string;
  scope?: string;
}

interface Props {
  value: string; // This will be the ID
  onChange: (id: string) => void;
  itemType: 'produto' | 'servico';
}

export function CategoryAutocomplete({ value, onChange, itemType }: Props) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadCategories();
  }, [itemType]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // We use the new 'categories' table with 'scope' field
      const { data, error } = await (supabase as any)
        .from('categories')
        .select('*')
        .order('nome');
      
      if (error) {
        // Fallback to 'categorias' if 'categories' doesn't exist yet (for transition)
        const { data: fallbackData, error: fallbackError } = await (supabase as any)
          .from('categorias')
          .select('id, nome, slug')
          .order('nome');
        
        if (fallbackError) throw fallbackError;
        setCategories(fallbackData || []);
      } else {
        // Filter by scope
        const filtered = (data as any[])?.filter((c: any) => 
          !c.scope || c.scope === 'both' || 
          (itemType === 'servico' ? c.scope === 'service' : c.scope === 'product')
        ) || [];
        setCategories(filtered);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (name: string) => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const scope = itemType === 'servico' ? 'service' : 'product';
      
      // Try 'categories' first
      const { data, error } = await supabase
        .from('categories')
        .insert({ 
          nome: name.trim(), 
          slug, 
          scope 
        })
        .select()
        .single();

      if (error) {
        // Fallback to 'categorias'
        const { data: fbData, error: fbError } = await supabase
          .from('categorias')
          .insert({ 
            nome: name.trim(), 
            slug
          })
          .select()
          .single();
        
        if (fbError) throw fbError;
        
        toast.success('Categoria criada!');
        await loadCategories();
        onChange(fbData.id);
      } else {
        toast.success('Categoria criada!');
        await loadCategories();
        onChange(data.id);
      }
      setOpen(false);
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('Esta categoria já existe');
      } else {
        toast.error('Erro ao criar categoria');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Categoria</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 rounded-xl surface-1 border-border/50 hover:bg-surface-2 transition-all font-normal"
          >
            {value ? (
              <span className="font-medium">
                {categories.find(c => c.id === value)?.nome || 'Selecionado'}
              </span>
            ) : (
              <span className="text-muted-foreground">Selecionar categoria...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-2xl border-border/50" align="start">
          <Command className="surface-1">
            <div className="flex items-center border-b border-border/50 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput 
                placeholder="Procurar categoria..." 
                onValueChange={setSearchValue}
                className="h-12 border-0 focus:ring-0"
              />
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <CommandEmpty className="p-4">
                    <div className="text-center space-y-3">
                      <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada.</p>
                      {searchValue && (
                        <Button 
                          type="button"
                          variant="secondary" 
                          size="sm" 
                          className="w-full rounded-lg h-9 font-bold"
                          onClick={() => handleCreateCategory(searchValue)}
                          disabled={creating}
                        >
                          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          Criar "{searchValue}"
                        </Button>
                      )}
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.nome}
                        onSelect={() => {
                          onChange(category.id === value ? '' : category.id);
                          setOpen(false);
                        }}
                        className="px-4 py-3 cursor-pointer hover:bg-primary/5 data-[selected=true]:bg-primary/10 rounded-lg transition-all"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-primary",
                            value === category.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="flex-1 font-medium">{category.nome}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
            
            {searchValue && !categories.some(c => c.nome.toLowerCase() === searchValue.toLowerCase()) && !loading && (
               <div className="p-2 border-t border-border/50">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start rounded-lg h-10 hover:bg-primary/5 text-primary font-bold"
                    onClick={() => handleCreateCategory(searchValue)}
                    disabled={creating}
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Criar nova categoria: "{searchValue}"
                  </Button>
               </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
