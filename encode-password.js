#!/usr/bin/env node

/**
 * MongoDB Password Encoder
 * Encodes special characters in MongoDB passwords for connection strings
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🔐 MongoDB Password Encoder\n');
console.log('This tool will encode special characters in your MongoDB password.');
console.log('Special characters like @, :, /, ?, #, % need to be URL-encoded.\n');

rl.question('Enter your MongoDB password: ', (password) => {
    if (!password) {
        console.log('❌ No password provided');
        rl.close();
        return;
    }

    // URL encode the password
    const encodedPassword = encodeURIComponent(password);

    console.log('\n✅ Encoded Password:');
    console.log('━'.repeat(50));
    console.log(encodedPassword);
    console.log('━'.repeat(50));

    // Show the full connection string format
    console.log('\n📋 Full MongoDB Connection String Format:');
    console.log(`mongodb+srv://webflow-app:${encodedPassword}@cluster0.xxxxx.mongodb.net/?appName=Cluster0`);

    // Show what was changed
    if (password !== encodedPassword) {
        console.log('\n🔄 Characters that were encoded:');
        const changes = [];
        for (let i = 0; i < password.length; i++) {
            const char = password[i];
            const encoded = encodeURIComponent(char);
            if (char !== encoded) {
                changes.push(`  "${char}" → "${encoded}"`);
            }
        }
        if (changes.length > 0) {
            console.log(changes.join('\n'));
        }
    } else {
        console.log('\n✨ No special characters found - password is safe to use as-is!');
    }

    console.log('\n');
    rl.close();
});
