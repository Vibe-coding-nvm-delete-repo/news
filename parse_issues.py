#!/usr/bin/env python3
import json
import sys
from datetime import datetime

def parse_issues():
    with open('issues.json', 'r') as f:
        issues = json.load(f)
    
    print(f"Total issues found: {len(issues)}")
    print("\n" + "="*80)
    
    for i, issue in enumerate(issues, 1):
        print(f"\n{i}. Issue #{issue['number']}")
        print(f"   Title: {issue['title']}")
        print(f"   State: {issue['state']}")
        print(f"   Labels: {[label['name'] for label in issue['labels']]}")
        print(f"   Created: {issue['created_at']}")
        print(f"   Updated: {issue['updated_at']}")
        
        # Show first 200 characters of body
        body = issue.get('body', '')
        if body:
            body_preview = body[:200].replace('\n', ' ')
            print(f"   Description: {body_preview}...")
        else:
            print("   Description: No description provided")
        
        print("-" * 60)

if __name__ == "__main__":
    parse_issues()