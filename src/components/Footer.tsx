import { Coffee } from 'lucide-react';
import { version } from '../../package.json';
import { AdminLoginButton } from './admin/AdminLoginButton';

export default function FooterComponent() {
    return (
        <footer className="relative py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 shadow-2xl">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-white mb-2">Nindroid Systems</h3>
                                <p className="text-white/70">Built with a passion for programming</p>
                            </div>

                            {/* Buy Me a Coffee */}
                            <a
                                href="https://buymeacoffee.com/nindroida"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 rounded-xl text-amber-300 hover:text-amber-200 transition-all duration-200 group"
                            >
                                <Coffee className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">Buy Me a Coffee</span>
                            </a>

                            <div className="flex items-center gap-4">
                                <AdminLoginButton variant="subtle" />
                                <div className="text-center md:text-right text-sm text-white/60">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
                                        <p className="text-white/80 font-medium">Version - {version}</p>
                                        <p className="mt-1">Developed by Andrew Curtis</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </footer>
    );
}