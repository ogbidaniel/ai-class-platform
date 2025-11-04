'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import Apps from './icons/Apps';
import Avatar from './Avatar';
import Feedback from './icons/Feedback';
import Help from './icons/Help';
import IconButton from './IconButton';
import PlainButton from './PlainButton';
import Videocam from './icons/Videocam';
import Settings from './icons/Settings';
import useTime from '../hooks/useTime';

interface HeaderProps {
  navItems?: boolean;
}

const Header = ({ navItems = true }: HeaderProps) => {
  const { data: session, status } = useSession();
  const { currentDateTime } = useTime();
  const router = useRouter();
  
  const isLoaded = status !== 'loading';
  const isSignedIn = !!session;
  const user = session?.user;
  const email = user?.email;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleSignIn = () => {
    router.push('/admin/login');
  };

  return (
    <header className="w-full px-4 pt-4 flex items-center justify-between bg-white">
      <div className="w-60 max-w-full">
        <a href="/#" className="flex items-center gap-2 w-full">
          <Videocam width={40} height={40} color="var(--primary)" />
          <div className="font-product-sans text-2xl leading-6 text-meet-gray select-none">
            <span className="font-medium">AI Class </span>
            <span>Platform</span>
          </div>
        </a>
      </div>
      <div className="flex items-center cursor-default">
        {navItems && (
          <>
            <div className="hidden md:block mr-2 text-lg leading-4.5 text-meet-gray select-none">
              {currentDateTime}
            </div>
            <div className="hidden sm:contents [&>button]:mx-2.5">
              <IconButton title="Support" icon={<Help />} />
              <IconButton title="Report a problem" icon={<Feedback />} />
              <IconButton title="Settings" icon={<Settings />} />
            </div>
          </>
        )}
        <div className="ml-2 flex items-center justify-end w-[6.5625rem] lg:ml-5">
          {navItems && (
            <div className="hidden sm:block">
              <IconButton title="AI apps" icon={<Apps />} />
            </div>
          )}
          <div
            className={clsx(
              'w-[3.04rem] grow flex items-center justify-end [&_img]:w-9 [&_span]:w-9 [&_img]:h-9 [&_span]:h-9',
              isLoaded ? 'animate-fade-in' : 'opacity-0'
            )}
          >
            {isSignedIn ? (
              <>
                {!navItems && (
                  <div className="hidden sm:block mr-3 font-roboto leading-4 text-right text-meet-black">
                    <div className="text-sm leading-4">{email}</div>
                    <div 
                      className="text-sm hover:text-meet-blue cursor-pointer"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </div>
                  </div>
                )}
                <div className="relative h-9">
                  <div className="absolute left-0 top-0 flex items-center justify-center pointer-events-none">
                    <Avatar
                      participant={{
                        name: user?.name || user?.email,
                        image: undefined,
                      }}
                      width={36}
                    />
                  </div>
                </div>
              </>
            ) : (
              <PlainButton size="sm" onClick={handleSignIn}>
                Sign In
              </PlainButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;