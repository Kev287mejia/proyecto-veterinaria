"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-surface">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <img alt="Vetsync Logo" className="w-16 h-16 object-contain mb-4" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAQAElEQVR4AezdCZidVX3H8f+5w5KQ4AKIivoolipi4tLWqtSaoLgmUVsNblVnBhU3FCURtYpUqo8SEFywxcpMAOujhlZlAjxFRUCQamtrIVChKC6IKJvAZJ+5p+edzCSTyV3e5bzv2b7zzJu5977ve87/fM4dfsx579xpCR8IIIAAAgiUECBASqBxCgIIIICACAHCswABVwL0i0DgAgRI4BNI+QgggIArAQLElTz9IoAAAoELBBwggctTPgIIIBC4AAES+ARSPgIIIOBKgABxJU+/CAQsQOkIZAIESKbAhgACCCBQWIAAKUzGCQgggAACmQABkik0vdEfAgggEIEAARLBJDIEBBBAwIUAAeJCnT4RQMCVAP1aFCBALGLSFAIIIJCSAAGS0mwzVgQQQMCiAAFiETOFphgjAgggMCNAgMxI8BUBBBBAoJAAAVKIi4MRQAABVwL+9UuA+DcnVIQAAggEIUCABDFNFIkAAgj4J0CA+DcnVFSPAK0igIBlAQLEMijNIYAAAqkIECCpzDTjRAABBCwL5A4Qy/3SHAIIIIBA4AIESOATSPkIIICAKwECxJU8/SKQW4ADEfBTgADxc16oCgEEEPBegADxfoooEAEEEPBTIIUA8VOeqhBAAIHABQiQwCeQ8hFAAAFXAgSIK3n6RSAFAcYYtQABEvX0MjgEEECgPgECpD5bWkYAAQSiFiBAvJ5eikMAAQT8FSBA/J0bKkMAAQS8FiBAvJ4eikMAAVcC9NtfgADpb8QRCCCAAAIdBAiQDig8hAACCCDQX4AA6W/EEWUEOAcBBKIXIECin2IGiAACCNQjQIDU40qrCCCAgCuBxvolQBqjpiMEEEAgLgECJK75ZDQIIIBAYwIESGPUdBSKAHUigEA+AQIknxNHIYAAAgjMESBA5oBwFwEEEEAgn4D9AMnXL0chgAACCAQuQIAEPoGUjwACCLgSIEBcydMvAvYFaBGBRgUIkEa56QwBBBCIR4AAiWcuGQkCCCDQqAABMoubmwgggAAC+QUIkPxWHIkAAgggMEuAAJmFwU0EEHAlQL8hChAgIc4aNSOAAAIeCBAgHkwCJSCAAAIhChAgIc7anjXzCAIIINC4AAHSODkdIoAAAnEIECBxzCOjQAABVwIJ90uAJDz5DB0BBBCoIkCAVNHjXAQQQCBhAQIk4cn3Y+hUgQACoQoQIKHOHHUjgAACjgUIEMcTQPcIIICAK4Gq/RIgVQU5HwEEEEhUgABJdOIZNgIIIFBVgACpKsj56QowcgQSFyBAEn8CMHwEEECgrAABUlaO8xBAAIHEBRwGSOLyDB8BBBAIXIAACXwCKR8BBBBwJUCAuJKnXwQcCtA1AjYECBAbirSBAAIIJChAgCQ46QwZAQQQsCFAgJRR5BwEEEAAASFAeBIggAACCJQSIEBKsXESAgg4EqBbjwQIEI8mg1IQQACBkAQIkJBmi1oRQAABjwQIEI8mo4lS6AMBBBCwJUCA2JKkHQQQQCAxAQIksQlnuAgg4Eogvn4JkPjmlBEhgAACjQgQII0w0wkCCCAQnwABEt+cxjoixoUAAp4JECCeTQjlIIAAAqEIECChzBR1IoAAAq4EuvRLgHSB4WEEEEAAgd4CBEhvH/YigAACCHQRIEC6wPAwAvYEaAmBOAUIkDjnlVEhgAACtQsQILUT0wECCCAQp0AIARKnPKNCAAEEAhcgQAKfQMpHAAEEXAkQIK7k6ReBEASoEYEeAgRIDxx2IYAAAgh0FyBAutuwBwEEEECghwAB0gOn+i5aQAABBOIVIEDinVtGhgACCNQqQIDUykvjCCDgSoB+6xcgQOo3pgcEEEAgSgECJMppZVAIIIBA/QIESP3GYfZA1QgggEAfAQKkDxC7EUAAAQQ6CxAgnV14FAEEEHAlEEy/BEgwU0WhCCCAgF8CBIhf80E1CCCAQDACBEgwU0WheQU4DgEEmhEgQJpxphcEEEAgOgECJLopZUAIIIBAMwJ7Bkgz/dILAskLLB5ZveTJ565+p/l68qKR1WeZ7TyzjS0aXX311Dayeszczx47Kztm+tglycMB4I0AAeLNVFBI7AKHffb4By0eXf1SEwafMl+vEiVntFoyJEpeppQ8x2xPNtsjlci8qU3JI8397LHnZMdMH3tGdm7WxhHnnviSrM3Y3RifvwIEiL9zQ2WRCDzl3Pc/cfHIqs/N33/e5WZIHzNh8HzzdT+zzf3Me3+/rI2BVuvUrE3z08pnjxg58Yi8J3McArYECBBbkrSDwByBRSPve8zikdWfaiv9ZVHq2XN2W7trflo5siWt8xaPrPrkk7504mOtNUxDCPQRIED6ALEbgaICR4yufsSikVV/q9TAOlHyfLMMZf4bX7SVYsdP9aHU0XsNtL5mfiL50GEjxz+sWAscjUBxgagCpPjwOQMBuwImPP5yQOSrSqm/Mi3vZbamP/cyafXX89W8dYvNRfqmO6e/tAQIkLTmm9HWKPDk0VVvaWn5tOliodlcfy7UIqebn0aGXRdC//EKECDxzi0ja0jgsM8ev++ikfd/oiXqOKXMolVD/fbrJqtFibxj8cjqUx83esq8fsdX28/ZKQq0Uhw0Y0bAlsATzjnxoPkL540qpV9oq03r7Sh5yf6y6UtcF7Eum3yDBEjyTwEAygpkP3nsu0/rM+ZnjieUbaO58/Th89X8M7Oam+uTnmIXIED8mGGqCFBg/sJ9/86U/USzWfl86aFPf8jXVrzn8H9//alPy7bs9ose99QHW2l8qhF9+LyF8z86dZN/ELAgQIBYQKSJ9AQWj64eFKWOtjXylxz6tAd/cslr/+hJBz5qwX577zuQbdntNUtff9iLDn3qg2z1ky21TdVuq0HaSVqAAEl6+hl8GYHFI6uO1ubidJlzu50zuGjJI7vtG1609JBu+8o8ntW+aOSkI8ucG+U5DKq0AAFSmo4TUxR4yvmrFoiok5SI1e+dQx9ycNdXST16/wO67pMSH0pM7ar90SPOfocPLzcuMQJO8UXA6jeBL4OiDgTqEmhvV8Oi5KG22583sPdAtzb332d+133dzun3uBI5sDVvwVC/49iPQC8BAqSXDvtyCKRzyJPOOSF7d9zXRjPilnrN4Z9/54HRjIeBNC5AgDROToehCgzstc9xomSfUOufW7cSve9e+y1469zHuY9AXoFW3gM5DoGUBRaPnPB4aemXRGeg9CuO+NJ7D4tuXIkMyPUwCRDXM0D/gQjs9V5z3cD6tQjXg8/GNNAaeI/rOug/TAECJMx5o+oGBaZeeaXUnzXYZbNdmbHxiqxmyWPpjQCJZSYZR3GBnGe02+ovzKF7my3Wz71bCxbweyGxzm6N4yJAasSl6UgE2mppJCPpPoxJRYB012FPFwECpAsMDxcUWDZ0pKwYPNNsP5IVQ/eb7TeyfHC9LB/6sLx86DEFW/PpcKWUjv4/rqqln2nQldn4RCC3QIUAyd0HB8YusGLw49KSa0TUCWZ7hojsb7ZDRKllouRUacuvTJCcJ0sHrf5Gtemj9s/Fo+9dZDpJ4Te2HzY9VjNcPhHIJ0CA5HPiqE4CK1fONz9pXCKiPiT9PpS8UfZXP5DsnH7HerR/UgYWe1ROraWkNNZaIRNqnABJaLKtD3XTglWmzSK/G/F02bzg7805wXy22q2ub3LochB19N1qK34rvQ7YiNskQCKe3FqH9rI3P9wsT51UuA+l3ifLhh9f+DxXJyjJ/R/V2X/P47rB0/60yNZveEXayo4t9/dECJB+88D+3QUIkN09uJdXoD3xQVFqQd7DdztOtd+2232P7yjRuQJk7t/zcD2kMn9PRCmdzE9brucnlv7TDJBYZs/pONQbKnRf5dwK3RY/Vef8CaTX3/Mo3qvdM/L+PZG8Y7VbHa2FLECAhDx7rmpfNnyUKDmgdPdKPSKYZSwtB+UZZ6+/55Hn/DqPyf33RHKOtc5aaTssAQIkrPnyo1qlV1YvpL20ehv+tLB9clL7U83cSpRPtc0tjvsBCxAgAU+ew9JfXbnvloQRIErukhwftz1wz5Ychzk5JHdtOcfqZBB06qUAAeLltHhc1PLBpZWWr2aGpuV5Mzd9/mr+3/3uPPWt3XDFHXmOc3HMuddf/ts8/eYda562OCYNAQIksHn2oNzqP31kg1DqUSFcB9GicgXIpbf+5L6TrvzKLT+9+/aNmye2TWZDdLmNb9sy+b933z6+6oov33LZL667P08teceapy2OSUOAAEljni2OUh1jr7EAroNoyRUgmUkWIseMnfXTZ375wz95ytr3/7jIlp3fayvSVnbskV85+SevHjvrJhMe9/Vqd7d9Bca623ncSVaAAEl26ksMvOqrr+Z2GcB1ENXSuQNk7vBCu5/SWMvNDWfNFSBA5opwv7uAlVdfzWpeywtm3fPyptaTN3tZWA1FpTTWGviSbJIASXLaSw/azvWPme4D+H2QDdvH/0NrGZ8pOeKv49lYIx4fQ6tBgACpATXKJqsvX3Vh8fw6yHFf3C6ifiCRf2htxjg11sgHyvCsChAgVjkjbsz28tUMVQDXQaSlr5gpN9qvKYwx2slzNzACxJ19aD3bXb6aGX0A10HaGzdmP4GYn0Rmio7u6/ZWS18T3agY0C6Bmm4RIDXBRtVsbctXRimA6yA3vvML46L1f5pq4/w0Y7vujadvjHNwjKpOAQKkTt1Y2q5r+Wqnj+fXQUydk+3Jz5gvUX7qljoryoExqNoFCJDaiaPooJ7lqxka76+DiNz45jNvMReaL5spOZav2Zg2DK75WSzjYRzNChAgzXqH11udy1czGtr/3wfJSt22dfvZWsT525RktdjYtKit27V83kZbtJGmAAGS5rznH3Xty1emlACug5gq5ea3n/kb0eqb2e0otrb8603HnnZ7FGNhEE4EmggQJwOjU2sC9S5f7SzT/+sgWakTmzZ+Mfs/9+y2ze2BbZu7/mTTa1+FGsbbevtohfM5FQEhQHgSdBdoYvlqpvcAroNkpf70XWffrUTWZLdtbrc9cO/mbu312tftnH6PT2r9MXNd555+x7EfgV4CBEgvndT3NbF8NWMcyHWQrNzrh077pm7LedltW1uvvyeS9+95dKylw4NZ7TcOn355h108hEAhAQKkEFdyBze0fGVcA7kOYiqd+tzw6wVni9bfmbpj4Z/sreBn/z2R8RJ/zyNXGVq+O1V7roM5CIHeAgRIb5909za5fLVTOYzrIFPlnnJKe/P41o+a2zeZzcpnFiIzf0+k1N/z6FOFFvV/m8e3nCynnNLucyi7EcglQID0ZEp4Z5PLVzPMgVwHmSn3lnd/bque2Pt9WtQdM495/PV3MrH1hKxmj2uktMAECJDAJqzBcl/VYF/TXaml0zf8/7Js6EhZMXjmhotuH7vhW3ctufPmTU/Y+sDkYdu36IdLW/n1faXl0gdkwSs3vOUzv/MflgpDEvDriR6SXMy1Lh9cKkoe5mCISbO2JQAAEABJREFUj5EVbzjUQb/Fulw+dKq05BoRdYLZnqEn9cI7Nmza34TIg7dvmnz0lvsnFk9sbh8sjj+0NldplP6H64fXfOQXQ6dscVxO4e45wX8BAsT/OWq+QiUrm+90uke919LpW/59Wblyvvmp41ITrh/uVNy9v9wqd2zYKJOTeq/tW9qP2Tbeflyn4xp6bFyJrNowePq5DfVHNwkKECAJTnrfIWvlLkCUPqpvfa4O2LRglYh6sfT42HjXdvnltffJfb/ZJhPb2gdu2zj52B6H17FrQmv9ja3b2q8yP3lcWUcHtInAjAABMiMR29ey49nx6isXy1c7Kvb190FWvPYgUeoDO4rs/e/kNi1mOUt+9cP75Q+3bT1oYmv7Qb3PqL5Xm+Uq0fJdrSdXbhg+/eM3H3fGXdVbpQUEegsQIL190tvr4tVXs5WVeoQsG3787Ie8uK33/bAo2a9ILds3t+V3N2ySW7//hwMmJ+THRc4tdKzW17a0+hvzE8dJG4Y//etC53IwAhUECJAKeJGeWu3VV1pvrOzSaj+3chvWG1CvK9vklvvbB974rTsXbn5gy/Mm2+2PZD8pmLY2ma3s56bpNk7O2rx++PTjrzv2NGu/j1K2KM7bKZDMjVYyI2Wg/QXsvPpqrWhd7fcitPLrOoiNZT2lXnfLZQ8858Zjz7g0+0nh+qE1zzUhcGK7LaOi5SKzBHW12W4w22+1yJapTctvzf3ssauzY9qiRtpK3pOdO93GJbe8+3P3959YjkCgHgECpB7XQFtVx1QuXKl1olTFt/jQL6xch80GVLu6S1aPklFZ9rqHZjezzYTAlTccu+Zs8/VjG4bXnGC2N5ltxYahNc+Z2obXrDD3s8dOyI65Yei0L9wwuOaa7Fw2BHwQIEB8mAV/aqj23lda7pGx0StF2ldUGZIJIM+ug1gI1ikQdbCofb4wdZN/EIhAgACJYBKtDGHHMs0BldpS+qtT57cHvjf1tdI/bT9+H8SGy2wHpV4jKwZfMfshbiMQqgABEurM2a7bxjKNlnVTZV088vPK10Fa4keA2HCRPT7Omb2UtcdeHkDAmUCxjgmQYl4RH61eWW1w+veyfu2upSsl367Wnnp+tfNtna0qunSqg6WsTio8Fp4AARLenNmveMcyTdVfHrxw98K0uRay+yMF7x3i/PdB7Lh0Hna2lLV88KWdd/IoAmEIECBhzFO9VdpYpplZvpqpdEJ2/TQiZT8cXwcp7lJsoHNelVXsZI5GwL0AAeJ+DjyoQFV7mWr26qvZy1fZiC4972fhXwep6JI59NwUr8rq6cNO3wUIEN9nqO76dizT2Hn11dxaq/4+iMv3xbLhMtej032Wsjqp8FggAl4FSCBmcZVpY5lm7vLVTqF2tWUsl++LZcNlp0OfGyxl9QFit68CBIivM9NYXcr+8tVM7UFfB6noMmOQ66tiKSuXEwf5JkCA+DYjTdZjY5lm5pcHO9Ud6nUQGy6dPHo95nwpq1dx7EOgswAB0tkljUdtLNN0Xb6aJgzxOogNl+nhF/rCUlYhLg52L0CAuJ8DhxWo+pavdo4qxOsgFV12jr3oDcVSVlEyjncqQIDY4Q+vFRvLNL2Wr2ZEQrsOYsNlZuxlvrKUVUaNcxwJECCO4J13a2OZpt/yVTbI0K6DuP6LjJkZS1mZAlsAAgRIAJNUT4mqgeWr6crDug5S7S3tp4dc7YtiKasIIMc6EyBAnNE77NjOMs3X8o8gkOsgdlzys/Q6kqWsXjrs80SAAPFkIhotw8YyjZIiAXJ55fEpvaRyG/0asOGi5fP9usm9X6kRedGx1d4lIHdnHIhAcQECpLhZDGfMWqYpMZzsva/GRvO/2+7YBbdWfl8spY8qUWnRU6q7rB893nT6dbPZ+Hy47D15to2GaAOBOgQIkDpUfW7TxjJNnldfzTXw/TqIDReZ/qmsvfVtkoXsXIMy91nKKqPGOQ0JECANQXvTTVOvvtpjwJ5fB7GxfCV6x08eF3/lXhH1ZrH1wauybEl6107oBREgRWdw+RufLSuGzpEVg1ea7S5ZMaSD2pR6W9Eh73683v0vD+6+s8e9tu/XQV7Vo/j+u7TcudtfZFw/8g3zU0iB60S9ulAHS2vfe4J6ngXzfTFovoenvpf/UV469Mxes8C+PQUIkD1NOj+ycuU+snzwNFEDV5sD3iqinmu2AyW9jzl/eTAngM/XQXYsXz0s50i6Hbani976dhMi93Q7gcd9EFDme3jqe/k4GdDXyPKhT0j2ve5DaQHUQIDknaQtC64WpVabwxM3UzuWaQxE8U91WfFzZp2h5Xmz7onYumNj+arTq9KypSylj7VVJu3ULaAGRMkHZfOC79fdUyztt2IZSK3jWD50qoh6hiT/YZavirz6aq6X1vlfuTX33Oy+Uo+SZcOPz25a3qotX0kPl7G13zQ/hVhayrI8aprrLKDUn8vywVM67+TR2QIEyGyNTreXD/2J+b+SD3XaleBjF1Yac7tigEx13l469cXWP3UtX82uj6Ws2Rph3FbqI/KyNz4ljGKdVDnVKQEyxdDzn3eZvTgZBBFVYflKRLL3xRK53dwq/9kSuwFiY/mqn0u2lCUWX5UlfDQg0BLdekcD/QTdBf9h7Dd9Sj+p3yFJ7M9+r6HK8tUupGqvxtLygl1NWblV/ZcH87hkr8oSqRbAVoZLIwUE+N7vg0WA9AESUYuEDxGlvypWPtr+/J30HctX1d4qpIjLrF8wtEJJI3ULHF53B6G3T4D0m0GtH+h3SBr7Ky5f7UTy6PdBmli+2jlucyNbyuJVWQYikE8tk4FU6qxMAqQfvZL/6XdI9PvtLV+J+PX7IM0sX81+gmSvymIpa7aIz7f/2+fifKgtzABpUk4rnkSiL7BKruTb1dpTz692vjm76eUr0+XOz22tt0v20t+dD3DDTwH1X37W5U9VBEi/uWi3zjHf7Nv6HRbtfi0T0pZP2h1f5ZfzHlL590GcvSeYkfy3c+8R3ar4ljKmHT5rFNCbRSb+qcYOomiaAOk3jZec+0tzyMlmS/RTj8ola++wOvj2wPeqt9eu+HJe9cpqNeiS7wk23Wv2qiwt50/fC+lLGrW29Udk/QW/SmOw5UdJgOSxG1v7KdHywzyHRnVMNuYt+2Rv32J3WBeP/Nx43lapUaWWlD5/+eBSUVLtva+0rCvd/8yJ60ffZByunbnLV08EtFwrF593hifVeF0GAZJ3etaPPku0tryUk7dzJ8d9WeaPHyXf+eJ9tfSudLWfQpQcXb4udUz5c6fPVKp6gGRNbZt4gQmRi7KbbB4IZN/j60eP9KCSIEogQIpM0/q1HxQ9mT25vmiui1xlAuXeIqdnx3q7ab3RjOdnZvuutPVzZWz0DbJu3eYa6632C4Uih8iLBx9Xsr763vuqaEGXXbBR1o++XKT9KhMkoyL6OjMH9xdthuPLCui7jflVZjvHfG8/U7Lv8bJNJXgeAVJ00teff635j+txMrZ2iXmyHWBuqyi29WsXmvEcZraj5eK19b8b6YSu3seAFH933h2vvqq2fCVyYdGnTd/jx877FxMkw+Z59VQzBw+O4jk1NhrA98bag4z5ErO9Tdaf/6O+88QBuwkQILtxcKcxgex9sbSudnG+JUul6IdqH1P0lD2Ot3H9Y49GeaB+AXqwLUCA2BalvfwCSn0n/8Edjiz1vlgVr39oucf8hFDt7Vg6DIWHEAhRgAAJcdaiqbld7T/ESj2i0O+D7Fi+au69r6KZJwaCQGcBAqSzC4/uKWD/kQmpFiCSfbTzL2OxfJWBsSFgTYAAsUZJQ4UFGr8OwvJV4TniBAR6CBAgPXDY1YBAU9dBWL5qYDLpojYBTxsmQDydmHTKaldbxsp7HYTlq3SeUoy0MQECpDFqOuoo0Nh1EJavOvrzIAIVBAiQCnicakGgiesgy4aPEiW8+srCdNEEArMFCJDZGtx2I1D3dRCWr9zMK71GL0CARD/FIQyw7usgLF+F8CygxvAE8gRIeKOi4rAE6rwOwquvwnouUG1QAgRIUNMVabF1Xgdh+SrSJw3D8kGAAPFhFqhBpLbrIIEvXwkfCPgrQID4OzeJVVbDdRCWrxJ7DjHcpgUIkKbF6a+zQB3XQVi+6mzNowhYEog8QCwp0Uz9ArVcB2H5qv6Jo4eUBQiQlGfft7HbvA7C8pVvs0s9EQoQIBFOarhDsngdhOUr508DCohfgACJf47DGaHV6yAsX4Uz8VQaqgABEurMxVi3jesgSi0Rlq9ifHYwJg8FCBAPJ2WqpFT/UfLtakPXLxSlV1ZrIztbfT37lw0BBLoLECDdbdjjQkCr71XqNvv7IEreUKkN0b+XsdErq7XB2QjEL0CAxD/HYY1wsn2VhYIXVmzjwornc3rYAlSfU4AAyQnFYQ0J2LgOUrVULeuqNsH5CKQgQICkMMuhjbHq74NUGa+We2T92mp/ZrdK/5yLQEACBEhAkxVKqdXrrPj7IFUKUPqrVU7nXARSEiBAUprtUMZq5fdBSg6W5auScJyWogABkuKs+z5mV9dBWL7y/ZlBfX0Fmj2AAGnWm97yCri5DvK1vOVxHAIIiBAgPAs8FXBxHUR/3VMMykLASwECxMtpoShp+jrIjuUrXn3FUw+BAgIESAEsDm1QoPnrICxfNTi9dBWHAAESxzzGOYpGr4OwfBXnk4hR1SlgNUDqLJS2UxRo6DoIy1cpPrkYswUBAsQCIk3UJNDcdRCWr2qaQpqNW4AAiXt+wx5dY9dBYli+CnuqqT5MAQIkzHlLp+q6r4OwfJXOc4mRWhcgQKyT0qBdgdqvg7B8lcBThyHWK0CA1OtL67YErF8HYfnK1tTQTroCBEi6cx/YyC1eB2H5KrC597fc1CsjQFJ/BoQyfrvXQVi+CmXeqdNrAQLE6+mhuJ0C2XUQkdt33q90g+WrSnycjMC0AAEyDcEXBwLFu7y8+ClzzmD5ag4IdxEoL0CAlLfjzMYFrFwHYfmq8Xmjw1gFCJBYZzbGcVm5DsLyVYxPDcZUWMDKCQSIFUYaaUQguw6i9R2l+2L5qjQdJyLQSYAA6aTCYz4LrC1dnNL/XPpcTkQAgT0ECJA9SHjAa4FJ9WnRMlG4Rq21yOSZhc/rcgIPI4CACAHCsyAsgUtH7xTR5xcuWql1MnbBrYXP4wQEEOgqQIB0pWGHtwLjG99jfgq5KHd9Wt8sWyeGcx/PgQggkEvATYDkKo2DEOgicMW6cVk/+nKzd7XZxs3W/VPL+aK3PUsuu2Bj94PYgwACZQQIkDJqnOOHwNjo6TJv/GDR7TeZn0guNJtZ3poq7SazzFfz0s4AAAazSURBVPUpUa0/NkHzJrn4K/dOPco/CCBgVYAAscpJY40LrFu3Wdafd74JipVmO1jGRpXZDpextR+Qi869pfF6/O+QChGwJkCAWKOkIQQQQCAtAQIkrflmtAgggIA1AQKkICWHI4AAAgjsECBAdjjwLwIIIIBAQQECpCAYhyOAgCsB+vVNgADxbUaoBwEEEAhEgAAJZKIoEwEEEPBNgADxbUbqq4eWEUAAAasCBIhVThpDAAEE0hEgQNKZa0aKAAKuBCLtlwCJdGIZFgIIIFC3AAFStzDtI4AAApEKECCRTmxcw2I0CCDgowAB4uOsUBMCCCAQgAABEsAkUSICCCDgSqBXvwRILx32IYAAAgh0FSBAutKwAwEEEECglwAB0kuHfQhUFeB8BCIWIEAinlyGhgACCNQpQIDUqUvbCCCAQMQCngdIxPIMDQEEEAhcgAAJfAIpHwEEEHAlQIC4kqdfBDwXoDwE+gkQIP2E2I8AAggg0FGAAOnIwoMIIIAAAv0ECJB+QmX3cx4CCCAQuQABEvkEMzwEEECgLgECpC5Z2kUAAVcC9NuQAAHSEDTdIIAAArEJECCxzSjjQQABBBoSIEAagg6pG2pFAAEE8ggQIHmUOAYBBBBAYA8BAmQPEh5AAAEEXAmE1S8BEtZ8US0CCCDgjQAB4s1UUAgCCCAQlgABEtZ8UW1vAfYigECDAgRIg9h0hQACCMQkQIDENJuMBQEEEGhQYLcAabBfukIAAQQQCFyAAAl8AikfAQQQcCVAgLiSp18EdhPgDgLhCRAg4c0ZFSOAAAJeCBAgXkwDRSCAAALhCcQSIOHJUzECCCAQuAABEvgEUj4CCCDgSoAAcSVPvwjEIsA4khUgQJKdegaOAAIIVBMgQKr5cTYCCCCQrAAB4nzqKQABBBAIU4AACXPeqBoBBBBwLkCAOJ8CCkAAAVcC9FtNgACp5sfZCCCAQLICBEiyU8/AEUAAgWoCBEg1v7TPZvQIIJC0AAGS9PQzeAQQQKC8AAFS3o4zEUAAAVcCXvRLgHgxDRSBAAIIhCdAgIQ3Z1SMAAIIeCFAgHgxDRTRtAD9IYBAdQECpLohLSCAAAJJChAgSU47g0YAAQSqC5QLkOr90gICCCCAQOACBEjgE0j5CCCAgCsBAsSVPP0iUE6AsxDwRoAA8WYqKAQBBBAIS4AACWu+qBYBBBDwRiC5APFGnkIQQACBwAUIkMAnkPIRQAABVwIEiCt5+kUgOQEGHJsAARLbjDIeBBBAoCEBAqQhaLpBAAEEYhMgQMKZUSpFAAEEvBIgQLyaDopBAAEEwhEgQMKZKypFAAFXAvTbUYAA6cjCgwgggAAC/QQIkH5C7EcAAQQQ6ChAgHRk4UG7ArSGAAIxChAgMc4qY0IAAQQaECBAGkCmCwQQQMCVQJ39EiB16tI2AgggELEAARLx5DI0BBBAoE4BAqROXdoOX4ARIIBAVwECpCsNOxBAAAEEegkQIL102IcAAggg0FWg5gDp2i87EEAAAQQCFyBAAp9AykcAAQRcCRAgruTpF4GaBWgegboFCJC6hWkfAQQQiFSAAIl0YhkWAgggULcAAdJNmMcRQAABBHoKECA9ediJAAIIINBNgADpJsPjCCDgSoB+AxEgQAKZKMpEAAEEfBMgQHybEepBAAEEAhEgQAKZqCJlciwCCCDQhAAB0oQyfSCAAAIRChAgEU4qQ0IAAVcCafVLgKQ134wWAQQQsCZAgFijpCEEEEAgLQECJK359n201IcAAgEJECABTRalIoAAAj4JECA+zQa1IIAAAq4ESvRLgJRA4xQEEEAAAREChGcBAggggEApAQKkFBsnITBXgPsIpCdAgKQ354wYAQQQsCJAgFhhpBEEEEAgPQFfAiQ9eUaMAAIIBC5AgAQ+gZSPAAIIuBIgQFzJ0y8CvghQBwIlBQiQknCchgACCKQuQICk/gxg/AgggEBJAQKkJNyu07iFAAIIpClAgKQ574waAQQQqCxAgFQmpAEEEHAlQL9uBQgQt/70jgACCAQrQIAEO3UUjgACCLgVIEDc+rvtnd4RQACBCgIESAU8TkUAAQRSFiBAUp59xo4AAq4EouiXAIliGhkEAggg0LwAAdK8OT0igAACUQgQIFFMY3qDYMQIIOBegABxPwdUgAACCAQpQIAEOW0UjQACCLgS2NUvAbLLglsIIIAAAgUECJACWByKAAIIILBLgADZZcEtBJoQoA8EohEgQKKZSgaCAAIINCtAgDTrTW8IIIBANALBBUg08gwEAQQQCFzg/wEAAP//koLq6QAAAAZJREFUAwAGkrGZGZPsNQAAAABJRU5ErkJggg==" />
          <h2 className="font-headline-lg text-[24px] font-bold text-primary mt-2">Bienvenido a Vetsync</h2>
          <p className="text-on-surface-variant text-sm mt-1">Inicia sesión en tu cuenta</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="email">Correo Electrónico</label>
            <input 
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
              id="email" 
              type="email" 
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="password">Contraseña</label>
            <input 
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest" />
              <span className="ml-2 text-sm text-on-surface-variant">Recordarme</span>
            </label>
            <Link href="#" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors">¿Olvidaste tu contraseña?</Link>
          </div>
          
          {error && <div className="text-error text-sm mt-2">{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors shadow-sm mt-4 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-sm text-on-surface-variant">¿No tienes una cuenta?</span>
          <Link href="/registro" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors ml-1">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}
