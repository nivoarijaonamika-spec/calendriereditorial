'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, Button, Avatar } from '@heroui/react';
import { authClient } from '@/lib/auth-client';

export default function Sidebar() {
    const pathname = usePathname();
    async function Deconnexion() {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        window.location.href = '/';
                    },
                },
            });
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
            alert('Une erreur est survenue lors de la déconnexion.');
        }
    }

    const navItems = [
        {
            name: 'Tableau de bord',
            href: '/dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
            ),
        },
        {
            name: 'Calendrier éditorial',
            href: '/calendrier-editorial',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0h18M9 15.75h6" />
                </svg>
            ),
        },
        {
            name: 'Accès manager',
            href: '/acces-manager',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v.75m-10.5-4.5v.75a2.25 2.25 0 0 1-2.25 2.25h10.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                </svg>
            ),
        },
        {
            name: 'Paramètres',
            href: '/parametres',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.09.69l.238.705c.158.47.5.8.933.8h1.32c.433 0 .776-.33.934-.8l.238-.705a1.125 1.125 0 0 1 1.09-.69l1.217.456c.355.133.752.072 1.075-.124.073-.044.146-.083.22-.127.332-.184.582-.496.645-.87l.213-1.281c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.09.69l.238.705c.158.47.5.8.933.8h1.32c.433 0 .776-.33.934-.8l.238-.705a1.125 1.125 0 0 1 1.09-.69l1.217.456c.355.133.752.072 1.075-.124.073-.044.146-.083.22-.127.332-.184.582-.496.645-.87l.213-1.281Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            ),
        },
    ];

    return (
        <Card className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col rounded-none border-r border-[#f04090]/15 bg-black shadow-xl shadow-black/40">
            <Card.Header className="border-b border-white/10 px-6 pb-6 pt-8 text-right">
                <div className="flex flex-col items-end gap-0.5">
                    <span className="text-3xl font-bold tracking-tight text-[#f04090]">
                       Viviworks.AI
                    </span>
                    <p className="text-[10px] font-medium tracking-[1.5px] text-[#6060a0]">
                        EDITORIAL SAAS
                    </p>
                </div>
            </Card.Header>

            <Card.Content className="flex-1 overflow-y-auto px-3 py-6">
                <nav className="flex flex-col items-end gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block w-full"
                            >
                                <Button
                                    variant={isActive ? 'primary' : 'ghost'}
                                    className={`h-12 w-full justify-end gap-3 rounded-3xl px-5 text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'bg-[#f04090] text-white shadow-[0_0_20px_rgba(240,64,144,0.35)] hover:bg-[#e03684]'
                                            : 'text-[#9090b8] hover:bg-white/5 hover:text-[#f0f0ff]'
                                        }`}
                                >
                                    <span className="truncate">{item.name}</span>
                                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : ''}`}>
                                        {item.icon}
                                    </span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </Card.Content>

            <Card.Footer className="mt-auto border-t border-white/10 bg-black p-4">
                <div className="flex w-full items-center gap-x-3 rounded-3xl border border-white/10 bg-[#0a0a0a] p-3">
                    <Avatar size="md" className="flex-shrink-0">
                        <Avatar.Fallback>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-5 w-5 text-[#f04090]"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.559-7.499-1.632Z" />
                            </svg>
                        </Avatar.Fallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[#f0f0ff]">
                            Curator One
                        </div>
                        <div className="text-xs font-medium text-[#f472b6]">Premium Plan</div>
                    </div>

                    <button
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#9090b8] transition-all duration-200 hover:bg-[#f04090]/10 hover:text-[#f04090]"
                        title="Se déconnecter"
                        type="button"
                        onClick={Deconnexion}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12"
                            />
                        </svg>
                    </button>
                </div>
            </Card.Footer>
        </Card>
    );
}
