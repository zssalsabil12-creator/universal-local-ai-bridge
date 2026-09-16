// TestProject - Main Application
// This file tests basic file reading functionality

export interface User {
  id: string;
  name: string;
  email: string;
}

export function main(): void {
  console.log('TestProject Application Started');
  
  const users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
  ];
  
  users.forEach(user => {
    console.log(`User: ${user.name} (${user.email})`);
  });
}

export function calculateSum(a: number, b: number): number {
  return a + b;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

main();
