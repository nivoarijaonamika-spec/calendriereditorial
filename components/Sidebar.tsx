'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, Button, Avatar } from '@heroui/react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Tableau de bord',
            href: '/dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
            ),
        },
        {
            name: 'Calendrier éditorial',
            href: '/calendrier-editorial',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0h18M9 15.75h6" />
                </svg>
            ),
        },
        {
            name: 'Accès manager',
            href: '/acces-manager',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v.75m-10.5-4.5v.75a2.25 2.25 0 0 1-2.25 2.25h10.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                </svg>
            ),
        },
        {
            name: 'Paramètres',
            href: '/parametres',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.09.69l.238.705c.158.47.5.8.933.8h1.32c.433 0 .776-.33.934-.8l.238-.705a1.125 1.125 0 0 1 1.09-.69l1.217.456c.355.133.752.072 1.075-.124.073-.044.146-.083.22-.127.332-.184.582-.496.645-.87l.213-1.281c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.09.69l.238.705c.158.47.5.8.933.8h1.32c.433 0 .776-.33.934-.8l.238-.705a1.125 1.125 0 0 1 1.09-.69l1.217.456c.355.133.752.072 1.075-.124.073-.044.146-.083.22-.127.332-.184.582-.496.645-.87l.213-1.281Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            ),
        },
    ];

    return (
        <Card className="w-64 h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl border-r border-zinc-800 bg-background rounded-none">

            {/* Logo / Header */}
            <Card.Header className="px-6 pt-8 pb-6 border-b border-zinc-800">
                <div className="flex items-baseline gap-x-1">
                    <span className="text-3xl font-bold tracking-tight text-pink-500">
                        Nocturne
                    </span>
                </div>
                <p className="text-[10px] font-medium tracking-[1.5px] text-default-500 mt-0.5">
                    EDITORIAL SAAS
                </p>
            </Card.Header>

            {/* Menu */}
            <Card.Content className="flex-1 px-3 py-6 overflow-y-auto">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block w-full"
                            >
                                <Button
                                    variant={isActive ? "primary" : "ghost"}
                                    className={`w-full h-12 px-5 text-sm font-medium rounded-3xl transition-all duration-200 flex items-center gap-3
    ${isActive
                                            ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-md'
                                            : 'hover:bg-zinc-900 text-default-500 hover:text-foreground'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : ''}`}>
                                        {item.icon}
                                    </div>
                                    {item.name}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </Card.Content>

            {/* Footer */}
            <Card.Footer className="mt-auto p-4 border-t border-zinc-800 bg-default-50">
                <div className="flex items-center gap-x-3 w-full bg-default-100 rounded-3xl p-3">
                    <Avatar size="md" className="flex-shrink-0">
                        <Avatar.Fallback>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.559-7.499-1.632Z" />
                            </svg>
                        </Avatar.Fallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                            Curator One
                        </div>
                        <div className="text-xs text-success font-medium">Premium Plan</div>
                    </div>
                </div>
            </Card.Footer>
        </Card>
    );
}