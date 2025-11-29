import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserRole } from '@/types/database';

interface InviteFormProps {
  pending?: boolean;
  onSubmit: (payload: { email: string; role: UserRole }) => Promise<void>;
}

export function InviteForm({ onSubmit, pending }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('company');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({ email, role });
    setEmail('');
    setRole('company');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">E-mail</label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nome@empresa.com"
          required
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de convite</label>
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger>
            <SelectValue defaultValue="company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">Empresa</SelectItem>
            <SelectItem value="psychologist">Psicólogo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Enviando...' : 'Gerar convite'}
      </Button>
    </form>
  );
}
