import { version } from '../../package.json';

export default function FooterComponent() {
    return (
        <footer className="relative py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 shadow-2xl">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-center md:text-left mb-6 md:mb-0">
                                <h3 className="text-xl font-bold text-white mb-2">Nindroid Systems</h3>
                                <p className="text-white/70">Built with a passion for programming</p>
                            </div>
                        
                            <div className="text-center md:text-right text-sm text-white/60">
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
                                    <p className="text-white/80 font-medium">Version - {version}</p>
                                    <p className="mt-1">Developed by Andrew Curtis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </footer>
    );
}