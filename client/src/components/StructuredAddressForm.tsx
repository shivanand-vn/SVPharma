import React from 'react';
import { FaCity, FaMap, FaHashtag, FaBuilding, FaLayerGroup, FaMapPin, FaLandmark } from 'react-icons/fa';
import type { Address } from '../types/address';

export type { Address }; // Re-export if needed for backward compatibility only temporarily, but prefer direct import elsewhere.

interface StructuredAddressFormProps {
    address: Address;
    onChange: (address: Address) => void;
    title?: string;
    showShopName?: boolean;
    compact?: boolean;
}

const StructuredAddressForm: React.FC<StructuredAddressFormProps> = ({ address, onChange, title, compact = false }) => {
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...address, [e.target.name]: e.target.value });
    };

    const baseInputClasses = compact
        ? "w-full py-2 rounded-lg bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-gray-700 text-xs"
        : "w-full py-3 md:py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-gray-700 text-sm";
    const inputWithIconClasses = compact ? `${baseInputClasses} pl-8 pr-2.5` : `${baseInputClasses} pl-12 pr-4 md:pr-5`;
    const inputNoIconClasses = compact ? `${baseInputClasses} px-2.5` : `${baseInputClasses} px-4 md:px-5`;
    const labelClasses = compact
        ? "text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block"
        : "text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block";
    const iconLeftClass = compact ? "left-2.5" : "left-5";

    return (
        <div className={`${compact ? 'space-y-4' : 'space-y-6'} animate-in slide-in-from-bottom-5 duration-500`}>
            {title && (
                <div className="flex items-center gap-3 text-teal-800 mb-2">
                    <FaMapPin size={compact ? 14 : 18} />
                    <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold`}>{title}</h3>
                </div>
            )}

            <div className={compact ? "grid grid-cols-1 md:grid-cols-6 gap-3" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>

                {/* Building & Floor */}
                <div className={compact ? "md:col-span-3" : ""}>
                    <label className={labelClasses}>Building Name (Optional)</label>
                    <div className="relative">
                        <FaBuilding size={compact ? 12 : 16} className={`absolute ${iconLeftClass} top-1/2 -translate-y-1/2 text-gray-300`} />
                        <input
                            name="building"
                            value={address.building || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder={compact ? "e.g. Block A" : "e.g. Shree Complex"}
                        />
                    </div>
                </div>
                <div className={compact ? "md:col-span-3" : ""}>
                    <label className={labelClasses}>Floor Number (Optional)</label>
                    <div className="relative">
                        <FaLayerGroup size={compact ? 12 : 16} className={`absolute ${iconLeftClass} top-1/2 -translate-y-1/2 text-gray-300`} />
                        <input
                            name="floor"
                            value={address.floor || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder="e.g. 2nd Floor"
                        />
                    </div>
                </div>

                {/* Area & Landmark */}
                <div className={compact ? "md:col-span-3" : "md:col-span-2"}>
                    <label className={labelClasses}>Area / Locality</label>
                    <input
                        name="area"
                        value={address.area || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder={compact ? "e.g. MG Road" : "e.g. Main Road, Gandhi Nagar"}
                    />
                </div>
                <div className={compact ? "md:col-span-3" : "md:col-span-2"}>
                    <label className={labelClasses}>Landmark (Optional)</label>
                    <div className="relative">
                        <FaLandmark size={compact ? 12 : 16} className={`absolute ${iconLeftClass} top-1/2 -translate-y-1/2 text-gray-300`} />
                        <input
                            name="landmark"
                            value={address.landmark || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder={compact ? "e.g. Near Bank" : "e.g. Near Bus Stand"}
                        />
                    </div>
                </div>

                {/* Taluk & City */}
                <div className={compact ? "md:col-span-3" : ""}>
                    <label className={labelClasses}>Taluk (TQ)</label>
                    <input
                        name="taluk"
                        value={address.taluk || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="Taluk"
                    />
                </div>
                <div className={compact ? "md:col-span-3" : ""}>
                    <label className={labelClasses}>City / Town (Required)</label>
                    <div className="relative">
                        <FaCity size={compact ? 12 : 16} className={`absolute ${iconLeftClass} top-1/2 -translate-y-1/2 text-gray-300`} />
                        <input
                            name="city"
                            value={address.city || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder={compact ? "City" : "City Name"}
                            required
                        />
                    </div>
                </div>

                {/* District & State */}
                <div className={compact ? "md:col-span-2" : ""}>
                    <label className={labelClasses}>District (Required)</label>
                    <input
                        name="district"
                        value={address.district || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="District"
                        required
                    />
                </div>
                <div className={compact ? "md:col-span-2" : ""}>
                    <label className={labelClasses}>State (Required)</label>
                    <div className="relative">
                        <FaMap size={compact ? 12 : 16} className={`absolute ${iconLeftClass} top-1/2 -translate-y-1/2 text-gray-300`} />
                        <input
                            name="state"
                            value={address.state || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder="State"
                            required
                        />
                    </div>
                </div>

                {/* Pincode */}
                <div className={compact ? "md:col-span-2" : "md:col-span-2"}>
                    <label className={labelClasses}>Pincode (Required)</label>
                    <div className="relative">
                        <FaHashtag size={compact ? 12 : 16} className={`absolute ${iconLeftClass} top-1/2 -translate-y-1/2 text-gray-300`} />
                        <input
                            name="pincode"
                            value={address.pincode || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder={compact ? "6-digit" : "6-digit Pincode"}
                            required
                            maxLength={6}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StructuredAddressForm;
