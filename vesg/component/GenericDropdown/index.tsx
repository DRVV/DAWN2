// components/GenericDropdown.tsx
'use client';

import React from 'react';
import styles from './GenericDropdown.module.css';
type DropdownItem = {
  id: number;
  category: string;
  value: string;
};

type Props = {
  options: DropdownItem[];
  selected?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
};

export default function GenericDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select an option',
  label,
}: Props) {
  return (
    <>
    {label && <label className={styles.label}>{label}</label>}
      <select
        className={styles.select}
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((item) => (
          <option key={item.id} value={item.value}>
            {item.value}
          </option>
        ))}
      </select>
    </>
  );
}
