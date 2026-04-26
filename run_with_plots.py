#!/usr/bin/env python3
"""
Wrapper to execute Python scripts and capture matplotlib plots.
Usage: python run_with_plots.py <script_path> <output_dir>
"""

import sys
import os
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import contextlib

if len(sys.argv) < 3:
    print("Usage: python run_with_plots.py <script_path> <output_dir>")
    sys.exit(1)

script_path = sys.argv[1]
output_dir = sys.argv[2]

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Capture stdout
output_buffer = io.StringIO()

try:
    # Read and execute the script
    with open(script_path, 'r') as f:
        script_code = f.read()
    
    # Redirect stdout to capture print statements
    with contextlib.redirect_stdout(output_buffer):
        # Execute the script in a controlled namespace
        exec_globals = {
            '__name__': '__main__',
            '__file__': script_path,
        }
        exec(script_code, exec_globals)
    
    # Save all matplotlib figures
    plot_count = 0
    for fig_num in plt.get_fignums():
        fig = plt.figure(fig_num)
        plot_path = os.path.join(output_dir, f'plot_{plot_count}.png')
        fig.savefig(plot_path, dpi=100, bbox_inches='tight')
        plot_count += 1
    
    # Print captured output
    print(output_buffer.getvalue())
    if plot_count > 0:
        print(f"\n[Generated {plot_count} plot(s)]")

except Exception as e:
    print(f"Error executing script: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
