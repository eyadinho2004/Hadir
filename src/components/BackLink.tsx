import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons';

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="btn btn-outline text-sm">
      <ArrowIcon className="size-4 rotate-180 rtl:rotate-0" />
      {label}
    </Link>
  );
}
