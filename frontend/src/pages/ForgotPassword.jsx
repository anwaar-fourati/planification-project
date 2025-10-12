import { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    console.log('Reset password for:', email);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-purple-100">
      {/* Decorative blurred circles */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl flex items-center justify-between gap-12">
          
          {/* Left Side - Message */}
          <div className="flex-1 hidden lg:block">
            <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
              No Worries.!!
            </h1>
            <button className="px-6 py-3 border-2 border-gray-900 text-gray-900 text-lg font-medium hover:bg-gray-900 hover:text-white transition-all duration-300 italic">
              Take me back.!
            </button>
          </div>

          {/* Right Side - Forgot Password Form */}
          <div className="w-full max-w-md">
            <div className="backdrop-blur-xl bg-white/30 rounded-3xl shadow-2xl p-8 border border-white/40">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password ?</h2>
                <p className="text-gray-700">Please enter your email</p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Email Input */}
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600"
                />

                {/* Reset Password Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl mt-2"
                >
                  Reset Password
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center space-y-3">
                <p className="text-sm text-gray-700">
                  Don’t have an account? <button className="text-purple-700 font-semibold hover:underline">Signup</button>
                </p>
                <div className="flex justify-center gap-3 text-xs text-gray-600">
                  <button className="hover:text-purple-700 transition-colors">Terms & Conditions</button>
                  <span>•</span>
                  <button className="hover:text-purple-700 transition-colors">Support</button>
                  <span>•</span>
                  <button className="hover:text-purple-700 transition-colors">Customer Care</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
