import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CollectionDefinition } from "@/lib/collectionAssignments";
import { getBlogPosts } from "@/lib/blogStorage";
import {
  buildRedirectOptions,
  resolveRedirectLabel,
  type RedirectOption,
} from "@/lib/homepageRedirectOptions";

type Props = {
  value: string;
  onChange: (path: string) => void;
  /** Loaded once in parent (Admin Sections) for labels + options */
  collections: CollectionDefinition[];
  id?: string;
};

function matchesNameQuery(label: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return label.toLowerCase().includes(q);
}

export default function RedirectDestinationPicker({ value, onChange, collections, id }: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const blogPosts = useMemo(() => getBlogPosts(), []);

  const options = useMemo(() => buildRedirectOptions(collections), [collections]);

  const label = useMemo(
    () => resolveRedirectLabel(value, collections, blogPosts),
    [value, collections, blogPosts]
  );

  const grouped = useMemo(() => {
    const m = new Map<string, RedirectOption[]>();
    for (const o of options) {
      if (!matchesNameQuery(o.label, searchQuery)) continue;
      const list = m.get(o.group) ?? [];
      list.push(o);
      m.set(o.group, list);
    }
    return m;
  }, [options, searchQuery]);

  const groupOrder = ["Site pages", "Curated collections"];

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setSearchQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-body text-sm h-10 bg-ivory-warm border-border text-foreground hover:bg-ivory-warm/80 font-normal"
          >
            <span className="truncate text-left">{label || "Select destination…"}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,420px)] p-0 border-border" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by name…"
              className="font-body text-sm"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty className="font-body text-sm py-6">No matching name.</CommandEmpty>
              {groupOrder.map((groupName) => {
                const items = grouped.get(groupName);
                if (!items?.length) return null;
                return (
                  <CommandGroup key={groupName} heading={groupName} className="font-body">
                    {items.map((opt) => (
                      <CommandItem
                        key={opt.path}
                        value={opt.path}
                        onSelect={() => {
                          onChange(opt.path);
                          setOpen(false);
                        }}
                        className="font-body text-sm cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            value === opt.path ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col items-start gap-0 min-w-0">
                          <span className="truncate font-medium">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate w-full">
                            {opt.path}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="space-y-1">
        <label className="font-body text-[10px] font-normal text-foreground/50 uppercase tracking-wider">
          Custom path (optional)
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.trimStart())}
          placeholder="e.g. /product/123 or paste any URL path"
          className="bg-ivory-warm border-border text-foreground text-sm h-9 font-mono"
        />
        <p className="font-body text-[11px] text-foreground/45 leading-snug">
          Search matches the listed names only. For a blog or product link, type the path below (e.g. <span className="font-mono">/blog/your-slug</span>).
        </p>
      </div>
    </div>
  );
}
