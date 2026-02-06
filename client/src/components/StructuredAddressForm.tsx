import React from 'react';
import { FaCity, FaMap, FaHashtag, FaBuilding, FaLayerGroup, FaMapPin, FaLandmark } from 'react-icons/fa';

export interface Address {
    floor: string;
    building: string;
    area: string;
    city: string;
    district: string;
    taluk: string;
    state: string;
    pincode: string;
    landmark: string;
}

interface StructuredAddressFormProps {
    address: Address;
    onChange: (address: Address) => void;
    title?: string;
    showShopName?: boolean;
}

const StructuredAddressForm: React.FC<StructuredAddressFormProps> = ({ address, onChange, title }) => {
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
                    <FaMapPin size={18} />
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Floor & Building */}
                <div>
                    <label className={labelClasses}>Floor Number (Optional)</label>
                    <div className="relative">
                        <FaLayerGroup className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            name="floor"
                            value={address.floor || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder="e.g. 2nd Floor"
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Building Name (Optional)</label>
                    <div className="relative">
                        <FaBuilding className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            name="building"
                            value={address.building || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder="e.g. Shree Complex"
                        />
                    </div>
                </div>

                {/* Area & City */}
                <div className="md:col-span-2">
                    <label className={labelClasses}>Area / Locality</label>
                    <input
                        name="area"
                        value={address.area || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="e.g. Main Road, Gandhi Nagar"
                    />
                </div>
                <div>
                    <label className={labelClasses}>City / Town (Required)</label>
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

                {/* Taluk & District */}
                <div>
                    <label className={labelClasses}>Taluk (TQ)</label>
                    <input
                        name="taluk"
                        value={address.taluk || ''}
                        onChange={handleFieldChange}
                        className={inputNoIconClasses}
                        placeholder="Taluk"
                    />
                </div>
                <div>
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

                {/* State & Pincode */}
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
                            maxLength={6}
                        />
                    </div>
                </div>

                {/* Landmark */}
                <div className="md:col-span-2">
                    <label className={labelClasses}>Landmark (Optional)</label>
                    <div className="relative">
                        <FaLandmark className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            name="landmark"
                            value={address.landmark || ''}
                            onChange={handleFieldChange}
                            className={inputWithIconClasses}
                            placeholder="e.g. Near Bus Stand"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StructuredAddressForm;
