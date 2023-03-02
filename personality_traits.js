module.exports = {
    getRandom: function (positive) {
        const positive_personalities = ['Adventurous', 'Agreeable', 'Ambitious', 'Brave', 'Calm', 'Cheerful', 'Compassionate', 'Confident', 'Considerate', 'Courageous', 'Creative', 'Diligent', 'Energetic', 'Friendly', 'Generous', 'Gentle', 'Happy', 'Helpful', 'Honest', 'Humorous', 'Independent', 'Inquisitive', 'Intelligent', 'Kind', 'Loyal', 'Modest', 'Neat', 'Passionate', 'Patient', 'Persistent', 'Polite', 'Positive', 'Practical', 'Quiet', 'Reliable', 'Resourceful', 'Sensible', 'Sincere', 'Sociable', 'Sympathetic', 'Thoughtful', 'Tolerant', 'Trusting', 'Understanding', 'Versatile', 'Wise', 'Witty', 'Warm', 'Wonderful'];
        const negative_personalities = ["Selfish", "Arrogant", "Cocky", "Manipulative", "Deceitful", "Defiant", "Disrespectful", "Vindictive", "Uncooperative", "Condescending", "Greedy", "Unreliable", "Judgmental", "Controlling", "Insensitive", "Pompous", "Stubborn", "Unemotional", "Provocative", "Gullible", "Ignorant", "Rash", "Rude", "Inconsiderate", "Moody", "Foolish", "Overbearing", "Unforgiving", "Dogmatic", "Vain", "Bigoted", "Nosy", "Disdainful", "Spiteful", "Callous", "Uncaring", "Unapproachable", "Combative", "Shallow", "Opportunistic", "Rigid", "Reckless", "Dishonest", "Inconsistent", "Sarcastic", "Distant", "Unapproachable", "Aggressive", "Opinionated", "Blunt", "Intolerant", "Stingy", "Incapable"];

        let min, max;
        if (positive) {
            min = 0
            max = Math.floor(positive_personalities.length);
            let i = Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
            return positive_personalities[i];
        } else {
            min = 0
            max = Math.floor(negative_personalities.length);
            let i = Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
            return negative_personalities[i];
        }
    }
}

