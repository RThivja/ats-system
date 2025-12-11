import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: 'bg-green-50 border-green-500 text-green-800',
        error: 'bg-red-50 border-red-500 text-red-800',
        info: 'bg-blue-50 border-blue-500 text-blue-800',
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${colors[type]} border-l-4 p-4 rounded-lg shadow-lg max-w-md`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{icons[type]}</span>
                    <p className="font-semibold">{message}</p>
                    <button
                        onClick={onClose}
                        className="ml-auto text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
}
