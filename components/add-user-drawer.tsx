"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Input,
  Button,
  Select,
} from "@heroui/react";

export default function AddUserDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onPress={() => setIsOpen(true)}
        className="rounded-full bg-[#f04090] px-8 font-semibold text-white shadow-[0_0_20px_rgba(240,64,144,0.35)]"
      >
        + Ajouter
      </Button>

      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <DrawerContent className="ml-auto h-screen max-w-md rounded-none border-l border-[#f04090]/20 bg-[#10101a] text-[#f0f0ff]">
          <DrawerHeader className="border-b border-white/10">
            Nouvel utilisateur
          </DrawerHeader>

          <DrawerBody className="space-y-5 py-6">
            <div className="space-y-2">
               <label className="text-xs uppercase tracking-widest text-zinc-400">
           Nom complet
          </label>
              <Input placeholder="Jean Dupont" />
            </div>

            <div className="space-y-2">
               <label className="text-xs uppercase tracking-widest text-zinc-400">
            Adresse email
          </label>
              <Input type="email" placeholder="jean@email.com" />
            </div>

            <div className="space-y-2">
               <label className="text-xs uppercase tracking-widest text-zinc-400">
            Mot de passe
          </label>
              <Input type="password" placeholder="••••••••" />
            </div>

            <div className="space-y-2">
               <label className="text-xs uppercase tracking-widest text-zinc-400">
           Role
          </label>
              <Select>
                <option value="admin">Administrateur</option>
                <option value="editor">Éditeur</option>
                <option value="viewer">Lecteur</option>
              </Select>
            </div>

            <div className="space-y-2">
               <label className="text-xs uppercase tracking-widest text-zinc-400">
            telephone
          </label>
              <Input placeholder="+33 6 00 00 00 00" />
            </div>
          </DrawerBody>

          <DrawerFooter className="border-t border-white/10">
            <Button
              
              onPress={() => setIsOpen(false)}
            >
              Annuler
            </Button>

            <Button className="bg-[#f04090] font-semibold text-white">
              Créer
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}