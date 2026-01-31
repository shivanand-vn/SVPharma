import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface PasswordStrengthIndicatorProps {
    password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const requirements = [
        { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
        { label: 'One uppercase letter (A-Z)', test: (pwd: string) => /[A-Z]/.test(pwd) },
        { label: 'One lowercase letter (a-z)', test: (pwd: string) => /[a-z]/.test(pwd) },
        { label: 'One number (0-9)', test: (pwd: string) => /\d/.test(pwd) },
        { label: 'One special character (@#$!%&)', test: (pwd: string) => /[@#$!%&]/.test(pwd) }
    ];

    const metRequirements = requirements.filter(req => req.test(password)).length;
    const strength = (metRequirements / requirements.length) * 100;

    const getStrengthColor = () => {
        if (strength < 40) return 'bg-red-500';
        if (strength < 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (strength === 0) return '';
        if (strength < 40) return 'Weak';
        if (strength < 80) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="space-y-3">
            {/* Password strength bar */}
            {password && (
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Password Strength</span>
                        <span className={`text-xs font-bold ${strength < 40 ? 'text-red-500' :
                                strength < 80 ? 'text-yellow-500' :
                                    'text-green-500'
                            }`}>
                            {getStrengthText()}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                            style={{ width: `${strength}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Requirements checklist */}
            <div className="space-y-2">
                <p className="text-xs text-gray-600 font-semibold">Password must contain:</p>
                {requirements.map((req, index) => {
                    const isMet = req.test(password);
                    return (
                        <div key={index} className="flex items-center gap-2">
                            {isMet ? (
                                <FaCheck className="text-green-500 text-xs" />
                            ) : (
                                <FaTimes className="text-red-400 text-xs" />
                            )}
                            <span className={`text-xs ${isMet ? 'text-green-700' : 'text-gray-500'}`}>
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
