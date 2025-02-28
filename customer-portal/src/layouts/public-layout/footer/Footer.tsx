import { Container } from '@/components/container';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1  gap-2 font-normal text-2sm">
            <span className="text-gray-500">{currentYear}&copy;</span>
            <Link to="/" className="text-gray-600 hover:text-primary">
              Provider
            </Link>
          </div>
          <nav className="flex order-1 md:order-2 gap-4 font-normal text-2sm text-gray-600"></nav>
        </div>
      </Container>
    </footer>
  );
};

export { Footer };
