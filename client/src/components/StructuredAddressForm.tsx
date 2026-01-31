import React from 'react';
import { FaMapMarkerAlt, FaCity, FaMap, FaHashtag, FaStore } from 'react-icons/fa';

export interface Address {
    shopName?: string;
    line1: string;
    line2?: string;
    area?: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
    landmark?: string;
}

interface StructuredAddressFormProps {
    address: Address;
    onChange: (address: Address) => void;
    title?: string;
    showShopName?: boolean;
}

const StructuredAddressForm: React.FC<StructuredAddressFormProps> = ({ address, onChange, title, showShopName = true }) => {
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...address, [e.target.name]: e.target.value });
    };

    const baseInputClasses = "w-full py-3 md:py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-gray-700 text-sm";
    const inputWithIconClasses = `${baseInputClasses} pl-12 pr-4 md:pr-5`;
    const inputNoIconClasses = `${baseInputClasses} px-4 md:px-5`;
    const labelClasses = "text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block";

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
            {title && (
                <div className="flex items-center gap-3 text-teal-800 mb-2">
                    <FaMapMarkerAlt size={18} />
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {showShopName && (
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Shop / Pharmacy Name (Optional)</label>
                        <div className="relative">
                            <FaStore className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                name="shopName"
                                value={address.shopName || ''}
                                onChange={handleFieldChange}
                                className={inputWithIconClasses}
                                placeholder="e.g. Health Plus Medicals"
                            />
                        </div>
                    </div>
                )}

                <div className="md:col-span-2">
                    <label className={labelClasses}>Address Line 1 (Required)</label>
                    <input
                        name="line1"
                        value={address.line1 || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="House / Building No., Street"
                        required
                    />
                </div>

                <div>
                    <label className={labelClasses}>Address Line 2 (Optional)</label>
                    <input
                        name="line2"
                        value={address.line2 || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="Floor, Apartment, Area"
                    />
                </div>

                <div>
                    <label className={labelClasses}>Area / Locality</label>
                    <input
                        name="area"
                        value={address.area || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="Neighborhood Name"
                    />
                </div>

                <div>
                    <label className={labelClasses}>City (Required)</label>
                    <div className="relative">
                        <FaCity className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            name="city"
                            value={address.city || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder="City Name"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>District</label>
                    <input
                        name="district"
                        value={address.district || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="District"
                    />
                </div>

                <div>
                    <label className={labelClasses}>State (Required)</label>
                    <div className="relative">
                        <FaMap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
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

                <div>
                    <label className={labelClasses}>Pincode (Required)</label>
                    <div className="relative">
                        <FaHashtag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            name="pincode"
                            value={address.pincode || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder="6-digit Pincode"
                            required
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className={labelClasses}>Landmark (Optional)</label>
                    <input
                        name="landmark"
                        value={address.landmark || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="e.g. Near Bus Stand"
                    />
                </div>
            </div>
        </div>
    );
};

export default StructuredAddressForm;
