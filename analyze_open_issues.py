#!/usr/bin/env python3
import json
import sys
from datetime import datetime

def analyze_open_issues():
    with open('issues.json', 'r') as f:
        issues = json.load(f)
    
    # Filter only open issues
    open_issues = [issue for issue in issues if issue['state'] == 'open']
    
    print(f"Total open issues found: {len(open_issues)}")
    print("\n" + "="*80)
    
    # Priority scoring system
    priority_scores = []
    
    for i, issue in enumerate(open_issues, 1):
        print(f"\n{i}. Issue #{issue['number']}")
        print(f"   Title: {issue['title']}")
        print(f"   Created: {issue['created_at']}")
        print(f"   Updated: {issue['updated_at']}")
        
        # Show first 300 characters of body
        body = issue.get('body', '')
        if body:
            body_preview = body[:300].replace('\n', ' ')
            print(f"   Description: {body_preview}...")
        else:
            print("   Description: No description provided")
        
        # Extract priority score if available
        priority_score = None
        if 'Priority Score:' in body:
            try:
                score_line = [line for line in body.split('\n') if 'Priority Score:' in line][0]
                priority_score = int(score_line.split('Priority Score:')[1].split('/')[0].strip())
            except:
                pass
        
        # Determine priority based on content analysis
        priority = determine_priority(issue, priority_score)
        priority_scores.append((issue['number'], issue['title'], priority, priority_score))
        
        print(f"   Priority: {priority}")
        print("-" * 60)
    
    # Sort by priority
    priority_scores.sort(key=lambda x: x[2], reverse=True)
    
    print("\n" + "="*80)
    print("PRIORITIZED LIST (Highest to Lowest Priority)")
    print("="*80)
    
    for i, (number, title, priority, score) in enumerate(priority_scores, 1):
        print(f"{i:2d}. #{number:3d} - {priority:8s} - {title}")
        if score:
            print(f"     (Original Score: {score}/10)")

def determine_priority(issue, existing_score):
    """Determine priority based on issue content and type"""
    title = issue['title'].lower()
    body = issue.get('body', '').lower()
    
    # Critical issues
    if any(keyword in title for keyword in ['critical', 'blocking', 'crash', 'security', 'vulnerability']):
        return 'CRITICAL'
    
    if any(keyword in body for keyword in ['critical', 'blocking', 'crash', 'security', 'vulnerability']):
        return 'CRITICAL'
    
    # High priority issues
    if any(keyword in title for keyword in ['fix:', 'bug', 'error', 'fail', 'broken']):
        return 'HIGH'
    
    if any(keyword in body for keyword in ['fix:', 'bug', 'error', 'fail', 'broken', 'runtime error']):
        return 'HIGH'
    
    # Security issues
    if '🔒' in title or 'security' in title.lower():
        return 'HIGH'
    
    # Performance issues
    if '⚡' in title or 'performance' in title.lower():
        return 'MEDIUM'
    
    # Testing issues
    if '🧪' in title or 'testing' in title.lower():
        return 'MEDIUM'
    
    # Code quality issues
    if '⚠️' in title or 'technical debt' in title.lower():
        return 'MEDIUM'
    
    # Documentation issues
    if '📝' in title or 'documentation' in title.lower():
        return 'LOW'
    
    # Accessibility issues
    if '♿' in title or 'accessibility' in title.lower():
        return 'MEDIUM'
    
    # Use existing score if available
    if existing_score:
        if existing_score >= 8:
            return 'HIGH'
        elif existing_score >= 6:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    # Default to medium for unclassified issues
    return 'MEDIUM'

if __name__ == "__main__":
    analyze_open_issues()