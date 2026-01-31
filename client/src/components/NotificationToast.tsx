import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { type Notification } from '../context/NotificationContext';

interface NotificationToastProps {
    notification: Notification;
    onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    const { message, type } = notification;

    const styles = {
        success: {
            bg: 'bg-white',
            border: 'border-l-4 border-green-500',
            icon: <FaCheckCircle className="text-green-500 text-xl" />,
            text: 'text-gray-800'
        },
        error: {
            bg: 'bg-white',
            border: 'border-l-4 border-red-500',
            icon: <FaExclamationCircle className="text-red-500 text-xl" />,
            text: 'text-gray-800'
        },
        warning: {
            bg: 'bg-white',
            border: 'border-l-4 border-amber-500',
            icon: <FaExclamationTriangle className="text-amber-500 text-xl" />,
            text: 'text-gray-800'
        },
        info: {
            bg: 'bg-white',
            border: 'border-l-4 border-blue-500',
            icon: <FaInfoCircle className="text-blue-500 text-xl" />,
            text: 'text-gray-800'
        }
    };

    const style = styles[type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto min-w-[300px] max-w-md w-full shadow-lg rounded-lg overflow-hidden flex items-center p-4 gap-3 ${style.bg} ${style.border} shadow-gray-200/50`}
        >
            <div className="shrink-0">
                {style.icon}
            </div>
            <div className={`flex-1 font-medium text-sm ${style.text}`}>
                {message}
            </div>
            <button
                onClick={onClose}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
                <FaTimes />
            </button>
        </motion.div>
    );
};

export default NotificationToast;
