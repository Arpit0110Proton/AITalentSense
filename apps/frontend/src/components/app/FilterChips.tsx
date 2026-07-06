"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { SPRING_SNAPPY, SPRING_SOFT } from "@/lib/motion";
import type { FilterSet, Seniority } from "@/lib/api";

interface FilterChipsProps {
  filters: FilterSet;
  onChange: (filters: FilterSet) => void;
}

const SENIORITY_BANDS: Seniority[] = ["junior", "mid", "senior", "lead", "director"];

const FILTER_ROWS: {
  key: keyof FilterSet;
  label: string;
  hint: string;
}[] = [
  { key: "titles", label: "TITLES", hint: "Not mentioned in the JD — add one if it matters." },
  { key: "skills", label: "SKILLS", hint: "Not mentioned in the JD — add one if it matters." },
  { key: "seniority", label: "SENIORITY", hint: "Not mentioned in the JD — add one if it matters." },
  { key: "locations", label: "LOCATIONS", hint: "Not mentioned in the JD — add one if it matters." },
  { key: "industries", label: "INDUSTRIES", hint: "Not mentioned in the JD — add one if it matters." },
];

function Chip({
  value,
  onRemove,
  onEdit,
}: {
  value: string;
  onRemove: () => void;
  onEdit: (newValue: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onEdit(trimmed);
    }
    setEditing(false);
    setEditValue(value);
  };

  const cancel = () => {
    setEditing(false);
    setEditValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  };

  return (
    <motion.div
      layout
      transition={SPRING_SOFT}
      className="inline-flex items-center"
    >
      {editing ? (
        <motion.input
          layout
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="rounded-chip border border-olive bg-cream px-3 py-1.5 font-satoshi text-small text-espresso outline-none focus:ring-2 focus:ring-olive focus:ring-offset-1"
          style={{ minWidth: `${Math.max(editValue.length * 8 + 24, 60)}px` }}
        />
      ) : (
        <motion.button
          layout
          onClick={() => setEditing(true)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={SPRING_SNAPPY}
          className="group/chip inline-flex items-center gap-1.5 rounded-chip border border-olive-40 bg-olive-10 px-3 py-1.5 font-satoshi text-small text-espresso transition-colors hover:border-olive"
        >
          <span>{value}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-full p-0.5 opacity-0 transition-opacity group-hover/chip:opacity-100 hover:bg-olive-10 focus:opacity-100"
            aria-label={`Remove ${value}`}
          >
            <X className="h-3 w-3 text-espresso-60" />
          </button>
        </motion.button>
      )}
    </motion.div>
  );
}

function AddChip({ onAdd }: { onAdd: (value: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed) onAdd(trimmed);
    setValue("");
    setAdding(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setValue("");
      setAdding(false);
    }
  };

  if (adding) {
    return (
      <motion.input
        layout
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter"
        className="rounded-chip border border-olive bg-cream px-3 py-1.5 font-satoshi text-small text-espresso outline-none focus:ring-2 focus:ring-olive focus:ring-offset-1"
        style={{ minWidth: 120 }}
      />
    );
  }

  return (
    <motion.button
      layout
      onClick={() => setAdding(true)}
      transition={SPRING_SNAPPY}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-1 rounded-chip border border-dashed border-tan px-3 py-1.5 font-satoshi text-small text-espresso-60 transition-colors hover:border-olive hover:text-espresso"
    >
      <Plus className="h-3 w-3" /> Add
    </motion.button>
  );
}

export function FilterChips({ filters, onChange }: FilterChipsProps) {
  const updateArray = (key: keyof FilterSet, newArr: string[]) => {
    onChange({ ...filters, [key]: newArr });
  };

  const removeItem = (key: keyof FilterSet, index: number) => {
    const arr = [...(filters[key] as string[])];
    arr.splice(index, 1);
    updateArray(key, arr);
  };

  const editItem = (key: keyof FilterSet, index: number, value: string) => {
    const arr = [...(filters[key] as string[])];
    arr[index] = value;
    updateArray(key, arr);
  };

  const addItem = (key: keyof FilterSet, value: string) => {
    const arr = [...(filters[key] as string[]), value];
    updateArray(key, arr);
  };

  const toggleSeniority = (band: Seniority) => {
    const current = [...filters.seniority];
    const idx = current.indexOf(band);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(band);
    onChange({ ...filters, seniority: current });
  };

  return (
    <div className="space-y-5">
      {FILTER_ROWS.map((row) => {
        if (row.key === "seniority") {
          return (
            <div key={row.key}>
              <span className="text-label text-espresso-60 mb-2 block">
                {row.label}
              </span>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {SENIORITY_BANDS.map((band) => {
                    const active = filters.seniority.includes(band);
                    return (
                      <motion.button
                        key={band}
                        layout
                        onClick={() => toggleSeniority(band)}
                        transition={SPRING_SNAPPY}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className={`rounded-chip px-3 py-1.5 font-satoshi text-small capitalize transition-colors ${
                          active
                            ? "border border-olive bg-olive text-cream"
                            : "border border-tan bg-cream text-espresso hover:border-olive"
                        }`}
                      >
                        {band}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
              {filters.seniority.length === 0 && (
                <p className="mt-1.5 font-satoshi text-small text-espresso-60 italic">
                  {row.hint}
                </p>
              )}
            </div>
          );
        }

        const values = filters[row.key] as string[];
        return (
          <div key={row.key}>
            <span className="text-label text-espresso-60 mb-2 block">
              {row.label}
            </span>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {values.map((val, i) => (
                  <Chip
                    key={`${row.key}-${i}-${val}`}
                    value={val}
                    onRemove={() => removeItem(row.key, i)}
                    onEdit={(newVal) => editItem(row.key, i, newVal)}
                  />
                ))}
              </AnimatePresence>
              <AddChip onAdd={(val) => addItem(row.key, val)} />
            </div>
            {values.length === 0 && (
              <p className="mt-1.5 font-satoshi text-small text-espresso-60 italic">
                {row.hint}
              </p>
            )}
          </div>
        );
      })}

      {/* Experience (years) row */}
      <div>
        <span className="text-label text-espresso-60 mb-2 block">EXPERIENCE</span>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={30}
            placeholder="Min"
            value={filters.minYears ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                minYears: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
            className="w-20 rounded-input border border-tan bg-cream px-3 py-2 font-satoshi text-small text-espresso outline-none focus:border-olive focus:ring-2 focus:ring-olive focus:ring-offset-1"
          />
          <span className="font-satoshi text-small text-espresso-60">to</span>
          <input
            type="number"
            min={0}
            max={30}
            placeholder="Max"
            value={filters.maxYears ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                maxYears: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
            className="w-20 rounded-input border border-tan bg-cream px-3 py-2 font-satoshi text-small text-espresso outline-none focus:border-olive focus:ring-2 focus:ring-olive focus:ring-offset-1"
          />
          <span className="font-satoshi text-small text-espresso-60">years</span>
        </div>
        {filters.minYears === null && filters.maxYears === null && (
          <p className="mt-1.5 font-satoshi text-small text-espresso-60 italic">
            Not mentioned in the JD — add one if it matters.
          </p>
        )}
      </div>
    </div>
  );
}
