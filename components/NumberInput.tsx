import React, { useState, useEffect } from 'react';
import { parseInputNumber, formatForDisplay } from '../utils';

interface NumberInputProps {
    onCommit: (value: number) => void;
    placeholder?: string;
    className?: string;
    value?: number | string;
    autoFocus?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({ onCommit, placeholder, className, value, autoFocus }) => {
    const [localValue, setLocalValue] = useState(formatForDisplay(value));

    useEffect(() => {
        setLocalValue(formatForDisplay(value));
    }, [value]);

    const handleBlur = () => {
        const number = parseInputNumber(localValue);
        onCommit(number);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9۰-۹,-]/g, '');
        setLocalValue(val);
    };

    return (
        <input
            type="text"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
            placeholder={placeholder}
            autoFocus={autoFocus}
            dir="ltr" // Numbers often look better LTR even in Persian interfaces when editing
        />
    );
};