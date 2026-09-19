import {
  COLLECTION_ICON_KEYS,
  COLLECTION_ICON_LABELS,
  getCollectionIconComponent,
  type CollectionIconKey,
} from "@/lib/collectionIcons";

interface CollectionIconPickerProps {
  value: CollectionIconKey;
  onChange: (key: CollectionIconKey) => void;
  /** Shown above the grid */
  label?: string;
}

export function CollectionIconPicker({ value, onChange, label = "Collection icon" }: CollectionIconPickerProps) {
  return (
    <div className="space-y-2">
      <p className="font-body text-sm text-foreground/80">{label}</p>
      <p className="font-body text-xs text-muted-foreground">Shown next to the name on the public collection page and in the admin menu.</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {COLLECTION_ICON_KEYS.map((key) => {
          const Icon = getCollectionIconComponent(key);
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              title={COLLECTION_ICON_LABELS[key]}
              onClick={() => onChange(key)}
              className={`flex items-center justify-center h-10 w-full rounded-md border transition-colors ${
                selected
                  ? "border-maroon bg-maroon/10 ring-1 ring-maroon"
                  : "border-border hover:border-foreground/25 bg-background"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} className="text-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
