import React from 'react';

interface QuantityInputProps {
    quantity: number;
    onChange: (qty: number) => void;
    className?: string;
}

export const QuantityInput = ({ quantity, onChange, className = '' }: QuantityInputProps) => {
    const [localVal, setLocalVal] = React.useState(quantity.toString());

    React.useEffect(() => {
        setLocalVal(quantity.toString());
    }, [quantity]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Strip out any non-digit character
        const val = e.target.value.replace(/[^0-9]/g, '');
        setLocalVal(val);

        if (val !== '') {
            const num = parseInt(val, 10);
            if (num >= 1) {
                onChange(num);
            }
        }
    };

    const handleBlur = () => {
        const num = parseInt(localVal, 10);
        if (isNaN(num) || num < 1) {
            setLocalVal('1');
            onChange(1);
        } else {
            setLocalVal(num.toString());
            onChange(num);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
            e.currentTarget.blur();
        }
    };

    return (
        <input
            type="text"
            value={localVal}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-12 text-center bg-transparent font-black text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded p-1 ${className}`}
        />
    );
};
