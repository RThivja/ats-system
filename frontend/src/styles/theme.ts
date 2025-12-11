// Centralized theme and style constants
// Edit here to change styles across the entire app!

export const colors = {
    primary: {
        main: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        text: 'text-blue-600',
        light: 'bg-blue-50',
        border: 'border-blue-600',
    },
    secondary: {
        main: 'bg-gray-600',
        hover: 'hover:bg-gray-700',
        text: 'text-gray-600',
        light: 'bg-gray-50',
    },
    success: {
        main: 'bg-green-600',
        hover: 'hover:bg-green-700',
        text: 'text-green-600',
        light: 'bg-green-50',
        badge: 'bg-green-100 text-green-800',
    },
    danger: {
        main: 'bg-red-600',
        hover: 'hover:bg-red-700',
        text: 'text-red-600',
        light: 'bg-red-50',
        badge: 'bg-red-100 text-red-800',
    },
    warning: {
        main: 'bg-yellow-600',
        hover: 'hover:bg-yellow-700',
        text: 'text-yellow-600',
        light: 'bg-yellow-50',
        badge: 'bg-yellow-100 text-yellow-800',
    },
};

export const buttons = {
    primary: `${colors.primary.main} text-white px-6 py-3 rounded-lg ${colors.primary.hover} transition font-semibold`,
    secondary: `${colors.secondary.main} text-white px-6 py-3 rounded-lg ${colors.secondary.hover} transition`,
    success: `${colors.success.main} text-white px-4 py-2 rounded-lg ${colors.success.hover} transition text-sm`,
    danger: `${colors.danger.main} text-white px-4 py-2 rounded-lg ${colors.danger.hover} transition`,
    outline: 'border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition',
};

export const cards = {
    base: 'bg-white rounded-lg shadow p-6',
    hover: 'bg-white rounded-lg shadow p-6 hover:shadow-lg transition',
    stats: 'bg-white rounded-lg shadow p-6 border-l-4',
};

export const badges = {
    matchScore: {
        excellent: 'text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-semibold',
        good: 'text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-semibold',
        average: 'text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-semibold',
        low: 'text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm font-semibold',
    },
    status: {
        APPLIED: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold',
        VIEWED: 'bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold',
        SHORTLISTED: 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold',
        INTERVIEW: 'bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-semibold',
        REJECTED: 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold',
        HIRED: 'bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold',
    },
};

export const inputs = {
    base: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    textarea: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
    select: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white',
};

export const layout = {
    container: 'max-w-7xl mx-auto px-4 py-8',
    navbar: 'bg-white shadow-sm',
    page: 'min-h-screen bg-gray-50',
};

// Helper function to get match score color
export const getMatchScoreClass = (score: number) => {
    if (score >= 90) return badges.matchScore.excellent;
    if (score >= 75) return badges.matchScore.good;
    if (score >= 60) return badges.matchScore.average;
    return badges.matchScore.low;
};

// Helper function to get status color
export const getStatusClass = (status: string) => {
    return badges.status[status as keyof typeof badges.status] || badges.status.APPLIED;
};
