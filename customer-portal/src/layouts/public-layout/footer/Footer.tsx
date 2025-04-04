import { Container } from '@/components/container';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { HeaderLogo } from '../header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Headphones, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = ({ className }: { className: string }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={clsx('footer flex flex-col px-10 lg:px-20 pt-24 pb-12', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 flex flex-col gap-6 pe-4">
          <HeaderLogo />
          <div className="">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo impedit eum corporis fuga
            aliquam ab consequuntur, architecto asperiores, minus inventore quia illum laborum
            dolores fugiat cupiditate fugit quaerat harum unde! Lorem ipsum dolor sit amet
            consectetur adipisicing elit. At nam voluptate aperiam perspiciatis, provident quaerat
            enim sed facilis fugiat et dolor cupiditate voluptatem, iure ea distinctio. Optio
            voluptatum fugit reprehenderit!
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex flex-col items-center gap-2">
            <div className="text-1.5xl font-medium text-primary mb-4">Quick links</div>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-gray-600 hover:text-primary">
                Home
              </Link>
              <Link to="/directory" className="text-gray-600 hover:text-primary">
                Directory
              </Link>
              <Link to="/" className="text-gray-600 hover:text-primary">
                About
              </Link>
              <Link to="/" className="text-gray-600 hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
        <div className="col-span-1 px-4">
          <div className="flex flex-col gap-2">
            <div className="text-1.5xl font-medium text-primary mb-4">Subscribe our newsletter</div>
            <div className="flex flex-col xl:flex-row gap-2 rounded-full ring-1 ring-white">
              <Input
                className="py-8 px-8 rounded-full"
                type="email"
                placeholder="Enter your email"
              />
              <Button className="btn-primary py-8 px-8 rounded-full">Send</Button>
            </div>
            <div className="text-1.5xl font-medium text-primary my-4">Stay connected</div>
            <div className="flex xl:flex-row items-center flex-col gap-2">
              <div className="flex items-center gap-2">
                <Headphones className="text-primary" />
                (+62) 345 67890
              </div>
              <Separator orientation="vertical" className="h-4 bg-black" />
              <div className="flex items-center gap-2">
                <Mail className="text-primary" />
                info@provdr.com.au
              </div>
            </div>
          </div>
        </div>
      </div>
      <Separator orientation="horizontal" className="my-6 bg-gray-300" />
      <div className="flex items-center text-black gap-1">
        ©<div className="">{currentYear}</div>
        Providr
      </div>
    </footer>
  );
};

export { Footer };
