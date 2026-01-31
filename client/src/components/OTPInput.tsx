import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, length = 6 }) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, digit: string) => {
        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return;

        const newValue = value.split('');
        newValue[index] = digit;
        const updatedValue = newValue.join('');

        onChange(updatedValue);

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // If current is empty, focus previous
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current
                const newValue = value.split('');
                newValue[index] = '';
                onChange(newValue.join(''));
            }
        }
        // Handle left arrow
        else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        // Handle right arrow
        else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Only accept if it's all digits and correct length
        if (/^\d+$/.test(pastedData) && pastedData.length === length) {
            onChange(pastedData);
            // Focus last input
            inputRefs.current[length - 1]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
            ))}
        </div>
    );
};

export default OTPInput;
